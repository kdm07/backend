const express = require("express");
const multer = require("multer");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const pool = require("./config");



router.post("/addRole", upload.none(), (req, res) => {
  const { roleName, roleDescription, minSalary } = req.body;

  pool.query(
    "INSERT INTO role (role, min_salary,department) VALUES ( ?,?,?)",
    [roleName, minSalary, 'DPR'],
    (err, result) => {
      if (err) {
        console.error("Error inserting materials :", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(201).json({ message: "Role added successfully" });
    }
  );
});

module.exports = router;
