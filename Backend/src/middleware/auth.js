const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;
const { User } = require("../models/user");

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(401).json({ error: "Acesso negado" });
    }
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }
    if (user.tokenVersion !== decoded.version) {
      return res.status(401).json({ error: "Token inválido" });
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      admin: user.admin,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

module.exports = authMiddleware;