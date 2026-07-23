require("dotenv").config();
const express = require("express");
const path = require("path");
const app = require("./src/services/app");
const cors = require("cors");
const port = process.env.HTTP_PORT;
const { mongoconnect } = require("./src/services/mongodb");
const routes = require("./src/routes/routes");
const cookieParser = require("cookie-parser");

app.use(cors({
    origin: process.env.CORS_ADDRESS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

(async () => {
    try {
        await mongoconnect();
        await routes();
    } catch (error) {
        console.error('Erro ao iniciar a API:', error);
        process.exit(1);
    }
})();


app.listen(port, () => {
  console.log(`🛸 API HTTP iniciada na porta ${port}`);
});