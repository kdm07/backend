const { createPool } = require("mysql");

const pool = createPool({
  user: "root",
  host: "localhost",
  password: "your_new_password",
  connectionLimit: 10,
  database: "lims",
  // connectTimeout: 20000, // Adjust this value as needed
});

module.exports = pool;
