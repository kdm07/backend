// const jwt = require("jsonwebtoken");
// const { KDM_ACCESS_TOKEN } = require("./constants");
// // const pool = require("./config");

// function verifyToken(request, response, next) {
//   let jwtToken;
//   const authHeader = request.headers["authorization"];
//   if (authHeader !== undefined) {
//     jwtToken = authHeader.split(" ")[1];
//   }
//   if (jwtToken === undefined) {
//     response.status(400).json({ jwt_token: "No jwt token" });
//   } else {
//     jwt.verify(jwtToken, KDM_ACCESS_TOKEN, async (error, payload) => {
//       if (error) {
//         response.status(400).json({ jwt_token: "Invalid JWT Token" });
//       } else {
//         request.user = payload;
//         next();
//       }
//     });
//   }
// }

// module.exports = { verifyToken };

const jwt = require("jsonwebtoken");
const { KDM_ACCESS_TOKEN } = require("./constants");
const pool = require("./config");

function verifyToken(request, response, next) {
  let jwtToken;
  console.log("hello world in verify token");
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    console.log("no jwt token");
    response.status(400).json({ jwt_token: "No jwt token" });
  } else {
    jwt.verify(jwtToken, KDM_ACCESS_TOKEN, async (error, payload) => {
      if (error) {
        console.log(error);
        response.status(400).json({ jwt_token: "Invalid JWT Token" });
      } else {
        request.user = payload;
        next();
      }
    });
  }
}

const getEmployeeUsingUsername = async (username) => {
  try {
    const userIdQuery = `select * from employee where username = ?`;
    const queryValues = [username];

    return await new Promise((resolve, reject) => {
      pool.query(userIdQuery, queryValues, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res[0]);
        }
      });
    });
  } catch (err) {
    throw err;
  }
};

const getEmployeeUsingId = async (id) => {
  try {
    const userIdQuery = `select * from employee where emp_id = ?`;

    return await new Promise((resolve, reject) => {
      pool.query(userIdQuery, id, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res[0]);
        }
      });
    });
  } catch (err) {
    throw err;
  }
};

module.exports = { verifyToken, getEmployeeUsingUsername, getEmployeeUsingId };
