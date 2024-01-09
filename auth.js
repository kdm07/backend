const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const pool = require("./config");

router.post("/verify", upload.none(), (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM employee WHERE username = ?";
  try {
    pool.query(query, [username], (err, results) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Failed to initialise Database error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid Username" });
      }

      const user = results[0];

      bcrypt.compare(password, user.hashed_password, (compareErr, isMatch) => {
        if (compareErr) {
          return res
            .status(500)
            .json({ error: "Error comparing passwords please try again" });
        }

        if (isMatch) {
          const secretKey = "KDM_ACCESS_TOKEN";
          const token = jwt.sign({ username }, secretKey);
          return res.status(200).json({ jwt_token: token, user: user });
        } else {
          return res.status(401).json({ error: "Invalid Password" });
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
