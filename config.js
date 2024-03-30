const { createPool } = require("mysql");

// Production DB
// const pool = createPool({
//   user: "admin",
//   host: "database-1.c98oisyqu0gw.ap-south-1.rds.amazonaws.com",
//   password: "rgukt123",
//   connectionLimit: 10,
//   database: "productionDB",
// });

// Test DB
// const pool = createPool({
//   user: "admin",
//   host: "lims-db.cpscuwgkqwm8.ap-south-1.rds.amazonaws.com",
//   password: "rgukt123",
//   connectionLimit: 10,
//   database: "lims",
// });

const pool = createPool({
  user: "root",
  host: "localhost",
  password: "uday0403",
  connectionLimit: 10,
  database: "need",
});

module.exports = pool;
