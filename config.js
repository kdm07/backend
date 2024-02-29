const { createPool } = require("mysql");

// Production DB
<<<<<<< Updated upstream
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
  host: "127.0.0.1",
  password: "uday0403",
=======
const pool = createPool({
  user: "admin",
  host: "database-1.c98oisyqu0gw.ap-south-1.rds.amazonaws.com",
  password: "rgukt123",
>>>>>>> Stashed changes
  connectionLimit: 10,
  database: "productionDB",
});

// Test DB
// const pool = createPool({
//   user: "admin",
//   host: "lims-db.cpscuwgkqwm8.ap-south-1.rds.amazonaws.com",
//   password: "rgukt123",
//   connectionLimit: 10,
//   database: "lims",
// });

// const pool = createPool({
//   user: "root",
//   host: "127.0.0.1",
//   password: "keka@3061",
//   connectionLimit: 10,
//   database: "ramesh_sir_lims",
// });

module.exports = pool;
