const express = require("express");
const multer = require("multer");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const pool = require("./config");

router.get("/scope", (req, res) => {
  pool.query(
    "SELECT s.name,t.test_name,t.price,t.method,t.nabl_status FROM subgroup s join test t on s.id = t.sub_group order by s.name asc",
    (err, results) => {
      if (err) {
        console.error("Error executing SQL query:", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

router.get("", (req, res) => {
  pool.query("SELECT * FROM subgroup", (err, results) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.status(200).json(results);
    }
  });
});

router.get("/get/:id", (req, res) => {
  const id = req.params.id;
  pool.query(`SELECT * FROM subgroup where id = ${id}`, (err, results) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.status(200).json(results);
    }
  });
});

router.post("/add", upload.none(), (req, res) => {
  const { name, prefix, additional_info, group_id } = req.body;

  pool.query(
    "INSERT INTO subgroup (name, prefix,additional_info,group_id) VALUES (?, ?,?,?)",
    [name, prefix, additional_info, group_id],
    (err, result) => {
      if (err) {
        console.error("Error inserting materials :", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(201).json({ message: "Material group added successfully" });
    }
  );
});

module.exports = router;
