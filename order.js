const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const util = require("util");
const pool = require("./config");
const { orderConformationMail } = require("./sendMessage");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const writeFileAsync = util.promisify(fs.writeFile);

function createOrderDirectory(orderId) {
  const uploadDestination = path.join("public", "orders", orderId);
  if (!fs.existsSync(uploadDestination)) {
    fs.mkdirSync(uploadDestination);
  }
  return uploadDestination;
}

async function saveOrUpdateOrder(req, res, id) {
  const connection = await util.promisify(pool.getConnection).call(pool);

  try {
    console.log(req.body);
    await util.promisify(connection.beginTransaction).call(connection);

    await insertOrUpdateOrder(connection, req.body, req.file, id);

    await insertOrUpdateMaterials(connection, req.body, req.body.order_id);

    await insertOrUpdateTests(connection, req.body);
    // malil block
    // const customerResult = await getCustomerDetails(
    //   connection,
    //   req.body.customer_id
    // );

    // await orderConformationMail(
    //   // customerResult[0].email,
    //   "pavanmarapalli171862@gmail.com",
    //   customerResult[0].reporting_name
    // );

    //end of mail block

    await util.promisify(connection.commit).call(connection);
    connection.release();
    if (id) {
      return res
        .status(200)
        .json({ message: "Order data updated successfully" });
    } else {
      return res.status(200).json({ message: "Order data saved successfully" });
    }
  } catch (error) {
    console.log(error);
    await util.promisify(connection.rollback).call(connection);
    connection.release();
    return res.status(500).json({ error_msg: "Internal server error" });
  }
}

router.post("/assign/:orderId", upload.none(), async (request, response) => {
  const orderId = request.params.orderId;
  const data = request.body;
  const payload = JSON.parse(data.payload);

  const connection = await util.promisify(pool.getConnection).call(pool);
  try {
    await util.promisify(connection.beginTransaction).call(connection);
    const sqlQuery = `update orders set status = ?,assigned_on=? where order_id = ?`;
    await util
      .promisify(connection.query)
      .call(connection, sqlQuery, ["ASSIGNED", new Date(), orderId]);

    for (const obj of payload) {
      const { sample, test, employee } = obj;
      const sql = `UPDATE material_test SET assign_to = ?,status = ? WHERE sample_id = ? AND test_id = ?`;
      const values = [employee, "IN_PROGRESS", sample, test];

      await new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });
    }

    await util.promisify(connection.commit).call(connection);
    connection.release();
    return response.status(200).json({ message: "Jobs created successfully" });
  } catch (error) {
    await util.promisify(connection.rollback).call(connection);
    connection.release();
    return res.status(500).json({ error_msg: "Internal server error" });
  }
});

async function getCustomerDetails(connection, customerId) {
  try {
    const getCustomerQuery = "SELECT * FROM customer WHERE id = ?";
    const customerResult = await util
      .promisify(connection.query)
      .call(connection, getCustomerQuery, [customerId]);
    return customerResult;
  } catch (error) {
    console.error("Error fetching customer details:", error);
    throw error;
  }
}

async function insertOrUpdateOrder(connection, orderData, file, id) {
  const {
    order_id,
    project_name,
    subject,
    parentRef,
    additional_info,
    discount,
    transport_fee,
    due_date,
    customer_id,
    order_number,
    PENDING_FOR_REVIEW,
  } = orderData;

  let letterPath = null;
  if (file) {
    const orderDirectory = createOrderDirectory(order_id);
    const originalFileName = file.originalname;
    const fileExtension = path.extname(originalFileName);
    const newFileName = `${order_id}_letter${fileExtension}`;
    const uploadedFilePath = path.join(orderDirectory, newFileName);

    try {
      await writeFileAsync(uploadedFilePath, file.buffer);
      letterPath = path.relative(
        path.join(__dirname, "public", "orders"),
        uploadedFilePath
      );
    } catch (err) {
      return res.status(500).json({ error_msg: "File upload error" });
    }
  }

  const sqlQuery = id
    ? `UPDATE orders
      SET
        project_name = ?,
        subject = ?,
        letter = ?,
        discount = ?,
        transport_fee = ?,
        due_date = ?,
        additional_info = ?,
        customer_id = ?,
        parent_ref = ?
      WHERE order_id = ?`
    : `INSERT INTO orders (
      order_id,
      project_name,
      subject,
      letter,
      additional_info,
      discount,
      transport_fee,
      due_date,
      registration_date,
      customer_id,
      status,
      order_number,
      parent_ref
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)`;

  const queryValues = id
    ? [
        order_id,
        project_name,
        subject,
        letterPath,
        additional_info,
        discount,
        transport_fee,
        due_date,
        new Date(),
        customer_id,
        PENDING_FOR_REVIEW,
        order_number,
        parentRef
      ]
    : [
        order_id,
        project_name,
        subject,
        letterPath,
        additional_info,
        discount,
        transport_fee,
        due_date,
        new Date(),
        customer_id,
        "PENDING_FOR_REVIEW",

        order_number,
        parentRef
      ];

  return await util
    .promisify(connection.query)
    .call(connection, sqlQuery, queryValues);
}

async function insertOrUpdateMaterials(connection, orderData, orderId) {
  const materials = JSON.parse(orderData.testData);
  const materialResults = [];
  for (const material of materials) {
    const { sampleId, subgroupId, materialSource, quantity, units, ref, brandName, refCode, sampleNum, siteName,weekNo } = material;
    const sqlQuery =
      "INSERT INTO order_material (order_id, sample_id, subgroup,source,quantity,job_number,brand_name,ref_code,sample_number,site_name,week_number) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    const queryValues = [
      orderId,
      sampleId,
      subgroupId,
      materialSource,
      quantity,
      ref,
      brandName, 
      refCode, 
      sampleNum,
      siteName,
      weekNo
    ];

    const result = await util
      .promisify(connection.query)
      .call(connection, sqlQuery, queryValues);
    materialResults.push(result);
  }

  return materialResults;
}

async function insertOrUpdateTests(connection, orderData) {
  const materials = JSON.parse(orderData.testData);

  for (let i = 0; i < materials.length; i++) {
    const tests = materials[i].selectedTests;
    for (const test of tests) {
      const sqlQuery =
        "INSERT INTO material_test (sample_id, test_id) VALUES (?, ?)";
      const queryValues = [materials[i].sampleId, test.testId];

      await util
        .promisify(connection.query)
        .call(connection, sqlQuery, queryValues);
    }
  }
}

// async function insertOrUpdateTests(connection, orderData) {
//   const materials = JSON.parse(orderData.testData);

//   for (let i = 0; i < materials.length; i++) {
//     const tests = materials[i].selectedTests;
//     for (const test of tests) {
//       const sqlQuery =
//         "INSERT INTO material_test (sample_id, test_id, test_result) VALUES (?, ?, ?)";
//       const queryValues = [
//         materials[i].sampleId,
//         test.testId,
//         JSON.stringify({
//           w: materials[i].w,
//           x: materials[i].x,
//           y: materials[i].y,
//           z: materials[i].z,
//         }),
//       ];

//       await util
//         .promisify(connection.query)
//         .call(connection, sqlQuery, queryValues);
//     }
//   }
// }

router.post("/add", upload.single("letter"), (req, res) => {
  saveOrUpdateOrder(req, res);
});

router.put("/update/:id", upload.single("letter"), (req, res) => {
  const id = req.params.id;
  saveOrUpdateOrder(req, res, id);
});

router.get("", (req, res) => {
  const sqlQuery = `
    SELECT * FROM orders order by order_number desc, due_date asc
  `;
  try {
    pool.query(sqlQuery, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Database error" });
      }

      const formattedOrders = results.map((each) => {
        return {
          order_number: each.order_number,
          order_id: each.order_id,
          project_name: each.project_name,
          due_date: each.due_date.toISOString().split("T")[0],
          customer_id: each.customer_id,
          status: each.status,
        };
      });

      return res.status(200).json(formattedOrders);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const query = util.promisify(pool.query).bind(pool);

router.get("/:orderId", async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const orderQuery = await query("SELECT * FROM orders WHERE order_id = ?", [
      orderId,
    ]);

    if (orderQuery.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderQuery[0];

    const customerDetails = await query(`select * from customer where id = ?`, [
      order.customer_id,
    ]);

    const sampleMaterials = await query(
      `SELECT om.week_number as weekNo,om.brand_name as brandName, om.ref_code as refCode, om.sample_number as sampleNum, om.site_name as siteName,om.job_number, om.quantity as qty , om.source as source, om.sample_id,sg.name as sampleName,sg.tech_ref as requirements
      FROM order_material om
      JOIN subgroup sg ON sg.id = om.subgroup
      WHERE om.order_id = ?`,
      [order.order_id]
    );

    // const sampleMaterials = await query(
    //   `SELECT om.job_number, om.quantity as qty , om.source as source, om.sample_id, sg.name as sampleName, sg.tech_ref as requirements, o.subject
    //   FROM order_material om
    //   JOIN subgroup sg ON sg.id = om.subgroup
    //   JOIN orders o ON o.order_id = om.order_id
    //   WHERE om.order_id = ?`,
    //   [order.order_id]
    // );
    

    const staffData = await query(
      `select CONCAT(emp.first_name, ' ', emp.last_name) AS name,emp.emp_id,dept.dept_id,profile_image as profile from department dept join employee emp on emp.department = dept.dept_id where dept_id in (?,?)`,
      ["LABORATORY_CHEMICAL", "LABORATORY_MECHANICAL"]
    );

    const finalResult = await Promise.all(
      sampleMaterials.map(async (eachSample) => {
        const beforeAssign =
          "select  mt.test_id,mt.test_result,mt.submitted_on,t.nabl_status,mt.status,mt.assign_to as assignedTo, t.discipline as discipline , t.price as price,t.test_limits ,t.test_name as testName,t.discipline from material_test mt join test t on t.id = mt.test_id where mt.sample_id = ?";
        const afterAssign =
          "select mt.test_id,mt.test_result,mt.submitted_on,t.nabl_status,mt.status,mt.assign_to as assignedTo, t.discipline as discipline,t.price as price,t.test_limits ,t.test_name as testName,t.discipline,t.id as testId,e.profile_image as empImage from material_test mt join test t on t.id = mt.test_id join employee e on e.emp_id = mt.assign_to   where mt.sample_id = ?";
        const tests = await query(
          order.status === "ASSIGNED" ? afterAssign : beforeAssign,
          [eachSample.sample_id]
        );

        return {
          ...eachSample,
          jobs: tests,
        };
      })
    );

    return res.status(200).json({
      samples: finalResult,
      staffData: staffData,
      orderDetails: order,
      customerDetails: customerDetails[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get(
  "/get/customer_subgroup_tests_orderNo",
  async (request, response) => {
    const connection = await util.promisify(pool.getConnection).call(pool);
    try {
      await util.promisify(connection.beginTransaction).call(connection);

      const getCustomers = `select * from customer`;
      const getTests = `select * from test`;
      const getSubgroups = `select * from subgroup`;
      const getCount = "SELECT COUNT(order_id) as c FROM orders";

      const customers = await util
        .promisify(connection.query)
        .call(connection, getCustomers);

      const tests = await util
        .promisify(connection.query)
        .call(connection, getTests);

      const subGroups = await util
        .promisify(connection.query)
        .call(connection, getSubgroups);

      const count = await util
        .promisify(connection.query)
        .call(connection, getCount);

      c = count[0].c;

      await util.promisify(connection.commit).call(connection);
      connection.release();
      return response.status(200).send({ customers, subGroups, tests, c });
    } catch (err) {
      console.log(err);
      await util.promisify(connection.rollback).call(connection);
      connection.release();
      return response.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
