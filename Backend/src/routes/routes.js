const app = require("../services/app");

const authRoutes = require("./authRoutes/authRoutes");
const usersRoutes = require("./usersRoutes/usersRoutes");
const servicesRoutes = require("./servicesRoutes/servicesRoutes");

function routes() {
    app.use("/api/v1", authRoutes);
    app.use("/api/v1", usersRoutes);
    app.use("/api/v1", servicesRoutes)
};

module.exports = routes;