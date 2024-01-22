const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const verifyToken = require("./verifyToken");

const pool = require("./config");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("", (req, res) => {
  pool.query(
    `SELECT *
    FROM invoicedata
    INNER JOIN customer ON invoicedata.customer_id = customer.id`,
    (err, results) => {
      if (err) {
        res.status(500).json({ error: "Error fetching data" });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

router.put("/:id", upload.none(), async (req, res) => {
  console.log("hhh");

  try {
    const { val, date } = req.body;
    const { id } = req.params;

    const updateQuery = `update invoicedata set tax_conversion = ?, tax_number = ?, tax_invoice_date = ? where invoice_number = '${id.toString()}'`;

    pool.query(updateQuery, [1, val, date.toString()], (err, success) => {
      if (err) {
        console.log(err);
      } else {
        console.log(success);
        return res.status(200).send({ message: "updated Successfully" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// router.put('/:invoiceNumber', upload.none(), async (req, res) => {
//   console.log('hhh')
//   // const { val } = req.body;
//   // console.log(val)
//   try {
//     const { invoiceNumber } = req.params;
//     console.log(invoiceNumber)

//     const getEmployeeByIdQuery = `SELECT * FROM invoicedata WHERE invoice_number = '${invoiceNumber}'`;

//     const result = pool.query(getEmployeeByIdQuery, (err, result) => {
//       if (err) {
//         res.status(500).json({ error: "Error fetching employee data" });
//       } else {
//         if (result.length > 0) {
//           const order = result[0];

//           if (order.tax_conversion === 1) {
//             return res.status(400).json({ error: 'Order already converted to tax' });
//           }

//           order.tax_conversion = 1;
//           order.tax_number += 1;

//           // order.tax_number = need.toString();

//           const updateOrderQuery = `
//             UPDATE invoicedata
//             SET tax_conversion = ${order.tax_conversion}, tax_number = ${order.tax_number}
//             WHERE order_number = '${order.order_number}'
//           `;

//           pool.query(updateOrderQuery, (err, result) => {
//             if (err) {
//               res.status(500).json({ error: "Error updating order data" });
//             } else {
//               res.status(404).json({ error: "Employee not found" });
//             }
//           });
//         } else {
//           res.status(404).json({ error: "Employee not found" });
//         }
//       }
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

router.get("/:id", (req, res) => {
  const { id } = req.params;
  // const getEmployeeByIdQuery = `
  //   SELECT * FROM invoicedata WHERE order_number = '${id}'
  // `;

  const getInvoiceByIdQuery = `
  SELECT *
  FROM invoicedata
  INNER JOIN customer ON invoicedata.customer_id = customer.id
  WHERE invoicedata.order_number = '${id}';
`;

  pool.query(getInvoiceByIdQuery, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Error fetching employee data" });
    } else {
      if (result.length > 0) {
        res.status(200).json(result[0]);
      } else {
        res.status(404).json({ error: "Employee not found" });
      }
    }
  });
});

router.get("/update/:id", (req, res) => {
  const { id } = req.params;
  // const getEmployeeByIdQuery = `
  //   SELECT * FROM invoicedata WHERE order_number = '${id}'
  // `;

  const getInvoiceByIdQuery = `
  SELECT *
  FROM invoicedata
  INNER JOIN customer ON invoicedata.customer_id = customer.id
  WHERE invoicedata.invoice_number = '${id}';
`;

  pool.query(getInvoiceByIdQuery, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Error fetching employee data" });
    } else {
      if (result.length > 0) {
        res.status(200).json(result[0]);
      } else {
        res.status(404).json({ error: "Employee not found" });
      }
    }
  });
});

router.get("/proforma/:id", (req, res) => {
  const { id } = req.params;
  const getEmployeeByIdQuery = `
    SELECT * FROM invoicedata WHERE customer_id = '${id}'
  `;

  const getInvoiceByIdQuery = `
  SELECT *
  FROM invoicedata
  INNER JOIN customer ON invoicedata.customer_id = customer.id
  WHERE invoicedata.invoice_number = '${id}';
`;

  pool.query(getInvoiceByIdQuery, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Error fetching employee data" });
    } else {
      if (result.length > 0) {
        res.status(200).json(result[0]);
      } else {
        res.status(404).json({ error: "Employee not found" });
      }
    }
  });
});

router.get("/tax/:id", (req, res) => {
  const { id } = req.params;
  const getEmployeeByIdQuery = `
      SELECT * FROM invoicedata WHERE customer_id = '${id}'
    `;

  const getInvoiceByIdQuery = `
    SELECT *
    FROM invoicedata
    INNER JOIN customer ON invoicedata.customer_id = customer.id
    WHERE invoicedata.invoice_number = '${id}';
  `;

  pool.query(getInvoiceByIdQuery, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Error fetching employee data" });
    } else {
      if (result.length > 0) {
        res.status(200).json(result[0]);
      } else {
        res.status(404).json({ error: "Employee not found" });
      }
    }
  });
});

function saveOrUpdateCustomer(req, res, id) {
  const customerData = {
    customerId: req.body.customer_id,
    subject: req.body.subject,
    project: req.body.project,
    ref: req.body.ref,
    invoiceNumber: req.body.invoiceNumber,
    orderNumber: req.body.orderNumber,
    orderDate: req.body.orderDate,
    matTest: req.body.matTest,
    discount: req.body.discount,
    transfee: req.body.transfee,
    geo: req.body.geo,
    paymentSchedules: req.body.paymentSchedules,
    totalPayment: req.body.totalPayment,
    percentage: req.body.percentage,
  };

  let sqlQuery;
  let queryValues;

  if (id === undefined) {
    sqlQuery = `
      INSERT INTO invoiceData (
        customer_id,
        subject,
        project,
        ref,
        invoice_number,
        order_number,
        order_date,
        mat_test,
        discount,
        transport_fee,
        geo,
        payment_schedules,
        total_payment,
        percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)`;
    queryValues = [
      customerData.customerId,
      customerData.subject,
      customerData.project,
      customerData.ref,
      customerData.invoiceNumber,
      customerData.orderNumber,
      customerData.orderDate,
      customerData.matTest,
      customerData.discount,
      customerData.transfee,
      customerData.geo,
      customerData.paymentSchedules,
      customerData.totalPayment,
      customerData.percentage,
    ];
  } else {
    sqlQuery = `
        UPDATE invoiceData
        SET
        customer_id = ? ,
        subject= ?,
        project= ?,
        ref= ?,
        invoice_number = ?,
        order_number= ?,
        order_date= ?,
        mat_test= ?,
        discount= ?,
        transport_fee= ?,
        geo= ?,
        payment_schedules= ?,
        total_payment = ?,
        percentage =?
        WHERE invoice_number = ?`;
    queryValues = [
      customerData.customerId,
      customerData.subject,
      customerData.project,
      customerData.ref,
      customerData.invoiceNumber,
      customerData.orderNumber,
      customerData.orderDate,
      customerData.matTest,
      customerData.discount,
      customerData.transfee,
      customerData.geo,
      customerData.paymentSchedules,
      customerData.totalPayment,
      customerData.percentage,
      id,
    ];
  }

  pool.query(sqlQuery, queryValues, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error_msg: "Internal server error" });
    } else {
      if (id) {
        res.status(200).json({ message: "Customer data updated successfully" });
      } else {
        res.status(200).json({ message: "Customer data saved successfully" });
      }
    }
  });
}

router.post("/add", upload.none(), (req, res) => {
  saveOrUpdateCustomer(req, res);
});

router.put("/update/:id", upload.none(), (req, res) => {
  const id = req.params.id;
  saveOrUpdateCustomer(req, res, id);
});

router.delete("/delete/:customer_id", (req, res) => {
  const customer_id = req.params.customer_id;
  const deleteCustomerQuery = "DELETE FROM Customer WHERE customer_id = ?";

  pool.query(deleteCustomerQuery, [customer_id], (err, result) => {
    if (err) {
      res.status(500).json({ error_msg: "Internal server error" });
    } else {
      if (result.affectedRows > 0) {
        res
          .status(200)
          .json({ message: "Customer record deleted successfully" });
      } else {
        res.status(404).json({ error_msg: "Customer not found" });
      }
    }
  });
});

module.exports = router;
