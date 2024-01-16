const { createPool } = require("mysql");

const pool = createPool({
  user: "root",
  host: "localhost",
  password: "uday0403",
  connectionLimit: 10,
  database: "lims",
});

module.exports = pool;
