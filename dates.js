const express = require("express");
const multer = require("multer");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const pool = require("./config");

router.get("", (req, res) => {
    pool.query("SELECT * FROM dates", (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Internal server error" });
        } else {
            return res.status(200).json(results);
        }
    });
});

// router.get("/get/:id", (req, res) => {
//     const id = req.params.id;

//     pool.query(`SELECT * FROM test where sub_group = ${id}`, (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: "Internal server error" });
//         } else {
//             return res.status(200).json(results);
//         }
//     });
// });

router.put("/update", upload.none(), (req, res) => {

    const cn = new Date();
    const sd = `01/03/${cn.getFullYear()}`;
    const ed = `31/02/${cn.getFullYear() + 1}`;
    const id = 1
    try {
        pool.query(
            `UPDATE dates SET start_date = ?, end_date = ? WHERE id = ?`,
            [sd.toString(), ed.toString(), id],
            (err, result) => {
                if (err) {
                    console.error("Error updating dates:", err);
                    return res.status(500).json({ error: "Internal server error" });
                } else {
                    res.status(200).json({ message: "Dates updated successfully" });
                }
            }
        );
    } catch (err) {
        console.error("Error updating dates:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// router.put("/add", upload.none(), (req, res) => {
//     console.log("this has to be triggered");
//     const {
//         start_date, end_date
//     } = req.body;

//     try {
//         pool.query(
//             `UPDATE dates SET (start_date = ?, end_date = ?) WHERE id=?`,
//             [
//                 start_date,
//                 end_date, 1
//             ],
//             (err, result) => {
//                 if (err) {
//                     console.error("Error inserting materials :", err);
//                     return res.status(500).json({ error: "Internal server error" });
//                 } else {
//                     res.status(201).json({ message: "Test added successfully" });
//                 }
//             }
//         );
//     } catch (err) {
//         return res.status(500).json({ error: "Internal server error" });
//     }
// });

module.exports = router;
