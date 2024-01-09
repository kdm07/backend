const { createPool } = require("mysql");

const pool = createPool({
  user: "root",
  host: "localhost",
  password: "your_new_password",
  connectionLimit: 10,
  database: "lims",
});

module.exports = pool;
