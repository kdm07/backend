const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const { KDM_ACCESS_TOKEN } = require("./constants");
const pool = require("./config");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("", async (req, res) => {
  console.log("random triggered");
  res.status(200).send({ message: " hello world am pavan" });
});

module.exports = router;
