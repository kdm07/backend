const { createPool } = require("mysql");

const pool = createPool({
  user: "admin",
  host: "lims-db.cpscuwgkqwm8.ap-south-1.rds.amazonaws.com",
  password: "rgukt123",
  connectionLimit: 10,
  database: "dongalims",
});

module.exports = pool;
