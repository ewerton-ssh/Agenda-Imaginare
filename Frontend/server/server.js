const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const app = express();

const port = process.env.HTTP_PORT;

const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

app.use((req, res) => {
  return res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`FrontEnd acessível em http://localhost:${port} 🚀`);
});