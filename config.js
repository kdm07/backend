const { createPool } = require("mysql");

// const pool = createPool({
//   user: "root",
//   host: "localhost",
//   password: "uday0403",
//   connectionLimit: 10,
//   database: "lims",
//   // connectTimeout: 20000, // Adjust this value as needed
// });

// const pool = createPool({
//   user: "admin",
//   host: "lims-db.cpscuwgkqwm8.ap-south-1.rds.amazonaws.com",
//   password: "rgukt123",
//   connectionLimit: 10,
//   database: "lims",
//   // connectTimeout: 20000, // Adjust this value as needed
// });

const pool = createPool({
  user: "admin",
  host: "lims-db.cpscuwgkqwm8.ap-south-1.rds.amazonaws.com",
  password: "rgukt123",
  connectionLimit: 10,
  database: "dongalims",
});

module.exports = pool;
