const express = require("express");
const multer = require("multer");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const pool = require("./config");

router.get("", (req, res) => {
  pool.query("SELECT * FROM test", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    } else {
      return res.status(200).json(results);
    }
  });
});

router.get("/get/:id", (req, res) => {
  const id = req.params.id;

  pool.query(`SELECT * FROM test where sub_group = ${id}`, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    } else {
      return res.status(200).json(results);
    }
  });
});

router.post("/add", upload.none(), (req, res) => {
  console.log("this has to be triggered");
  const {
    test_name,
    requirements = null,
    price = 0,
    method = null,
    discipline,
    nabl_status,
    sub_group,
    additional_info = null,
  } = req.body;

  try {
    pool.query(
      "INSERT INTO test (test_name, test_limits,price,method,discipline,nabl_status,sub_group,additional_info) VALUES ( ?,?,?,?, ?,?,?,?)",
      [
        test_name,
        requirements,
        parseInt(price),
        method,
        discipline,
        JSON.parse(nabl_status),
        parseInt(sub_group),
        additional_info,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting materials :", err);
          return res.status(500).json({ error: "Internal server error" });
        } else {
          res.status(201).json({ message: "Test added successfully" });
        }
      }
    );
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
