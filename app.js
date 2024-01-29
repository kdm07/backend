const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));
require("dotenv").config();

const port = process.env.PORT;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

// app.use(cors());

const employeeRoutes = require("./employee");
// const roles = require("./roles");
const customerRoutes = require("./customer");
const groups = require("./materialGroups");
const subgroup = require("./subGroup");
const test = require("./tests");
const order = require("./order");
const authRoute = require("./auth");
const jobs = require("./jobs");
const role = require("./roles");
const random = require("./random");

app.use("/employee", employeeRoutes);
app.use("/customer", customerRoutes);
app.use("/group", groups);
app.use("/subgroup", subgroup);
app.use("/test", test);
app.use("/order", order);
app.use("/auth", authRoute);
app.use("/jobs", jobs);
app.use("/role", role);
app.use("/random", random);
// app.use("/roles", roles);

app.listen(port, () => {
  console.log("Server started on port 8081");
});

// ALTER USER 'your_username'@'your_host' IDENTIFIED WITH 'mysql_native_password' BY 'your_password';
