const express = require("express");
const router = express.Router();
const { User } = require("../../models/user");
const authMiddleware = require("../../middleware/auth");

router.get("/users", authMiddleware, async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).json({
        error: "Acesso negado"
      });
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;

    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    return res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/users/names", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ date: -1 })
      .select("name");

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.put("/users/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).json({
        error: "Acesso negado"
      });
    }
    const { id } = req.params;
    const { admin } = req.body;

    if (req.user?.id === id) {
      return res.status(403).json({
        error: "Você não pode alterar suas próprias permissões"
      });
    }

    if (typeof admin !== "boolean") {
      return res.status(400).json({
        error: "admin deve ser boolean"
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const updatedData = {
      admin: admin ?? user.admin
    };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { returnDocument: "after" }
    );

    return res.status(200).json(updatedUser);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/users/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).json({
        error: "Acesso negado"
      });
    }

    const { id } = req.params;

    const currentUserId = req.user.id || req.user._id?.toString();
    if (currentUserId === id) {
      return res.status(403).json({
        error: "Você não pode deletar sua própria conta"
      });
    }
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        error: "Usuário não encontrado"
      });
    }

    return res.status(200).json({
      message: "Usuário removido com sucesso"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;