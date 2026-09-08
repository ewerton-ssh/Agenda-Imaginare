const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
//const crypto = require("crypto");

const { User } = require("../../models/user");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("../../middleware/auth");

const SECRET = process.env.JWT_SECRET;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Muitas tentativas, tente novamente mais tarde",
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Muitos tentativas de registro.",
  standardHeaders: true,
  legacyHeaders: false,
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ACCESS_EXPIRES = 15 * 60;
const REFRESH_EXPIRES = 30 * 24 * 60 * 60;

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      version: user.tokenVersion,
    },
    SECRET,
    {
      expiresIn: ACCESS_EXPIRES,
      issuer: "sectorseven",
      audience: "sectorseven-users",
    }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      version: user.tokenVersion,
      type: "refresh",
    },
    SECRET,
    {
      expiresIn: REFRESH_EXPIRES,
      issuer: "sectorseven",
      audience: "sectorseven-users",
    }
  );
}

function setAuthCookies(res, accessToken, refreshToken) {
  const secure = process.env.NODE_ENV === "production";

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: ACCESS_EXPIRES * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: REFRESH_EXPIRES * 1000,
  });
}

router.post("/register", registerLimiter, async (req, res) => {
  try {
    let {name, email, password } = req.body;
    let admin = false;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    name = name.trim();
    email = email.toLowerCase().trim();

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const count = await User.countDocuments();
    if (count === 0) admin = true;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      admin,
    });

    await user.save();

    return res.status(201).json({ message: "Usuário criado" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email }).select(
      "+password +loginAttempts +loginBlockedUntil"
    );

    if (!user) {
      return res.status(400).json({ error: "Credenciais inválidas" });
    }

    const now = Date.now();

    if (user.loginBlockedUntil && user.loginBlockedUntil.getTime() > now) {
      const wait = Math.ceil((user.loginBlockedUntil.getTime() - now) / 1000);
      return res.status(429).json({
        error: `Muitas tentativas. Tente novamente em ${wait}s`,
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        const extra = user.loginAttempts - 5;
        const delay = Math.min(30, Math.pow(2, extra)) * 60 * 1000;
        user.loginBlockedUntil = new Date(now + delay);
      }

      await user.save();

      return res.status(400).json({ error: "Credenciais inválidas" });
    }

    user.loginAttempts = 0;
    user.loginBlockedUntil = null;
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      message: "Login realizado com sucesso",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro no login" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        admin: user.admin,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;

    if (!token) {
      return res.sendStatus(401);
    }

    const decoded = jwt.verify(token, SECRET);

    if (decoded.type !== "refresh") {
      return res.sendStatus(401);
    }

    const user = await User.findById(decoded.id);

    if (!user || user.tokenVersion !== decoded.version) {
      return res.sendStatus(401);
    }

    const accessToken = generateAccessToken(user);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_EXPIRES * 1000,
    });

    return res.status(200).json({ message: "Token atualizado" });
  } catch (err) {
    return res.sendStatus(401);
  }
});

router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.tokenVersion += 1;
      await user.save();
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.json({ message: "Logout realizado com sucesso" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao fazer logout" });
  }
});

module.exports = router;