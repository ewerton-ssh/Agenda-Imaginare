const express = require("express");
const rateLimit = require("express-rate-limit");

const app = express();

app.set("trust proxy", 1);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, 
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Muitas requisições. Tente novamente mais tarde."
    }
});

app.use(apiLimiter);

app.use(express.json());

module.exports = app;