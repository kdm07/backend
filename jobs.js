const express = require("express");

const util = require("util");
const router = express.Router();
const { verifyToken } = require("./verifyToken");
const multer = require("multer");
const pool = require("./config");
const submitChemicalTest = require("./Controllers/submitChemicalTest");
const submitPhysicalTest = require("./Controllers/submitPhysicalTest");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/getRes/:sId/:tId", (request, response) => {
  const tId = request.params.tId;
  const sId = request.params.sId;
  try {
    const getTestQuery = `select * from material_test where sample_id = ? and test_id = ? `;
    pool.query(getTestQuery, [sId, tId], (err, testRes) => {
      if (err) {
        return response
          .status(500)
          .send({ err_message: "Internal server error" });
      } else {
        return response.status(200).send(testRes[0]);
      }
    });
  } catch (err) {
    console.log(err);
    return response.status(500).send({ err_message: "Internal server error" });
  }
});

router.put("/reject/:sId/:tId", upload.none(), async (request, response) => {
  const sId = request.params.sId;
  const tId = request.params.tId;
  try {
    const rejectQuery = `update  material_test set status = ? where sample_id = ? and test_id = ?`;
    pool.query(rejectQuery, ["REJECTED", sId, tId], (err, succ) => {
      if (err) {
        return response
          .status(500)
          .send({ err_message: "Failed to Reject the job" });
      } else {
        return response.status(200).send("Job Rejected successfully");
      }
    });
  } catch (err) {
    return response.status(500).send({ err_message: "Internal server error" });
  }
});

router.put("/finalize/:sId/:tId", upload.none(), (request, response) => {
  const tId = request.params.tId;
  const sId = request.params.sId;
  const query = `update material_test set status = ?  where sample_id = ? and test_id = ?`;
  try {
    pool.query(query, ["ACCEPTED", sId, tId], (err, testRes) => {
      if (err) {
        return response
          .status(500)
          .send({ err_message: "Internal server error" });
      } else {
        return response
          .status(200)
          .send({ message: "Test results are finalised" });
      }
    });
  } catch (err) {
    console.log(err);
    return response.status(500).send({ err_message: "Internal server error" });
  }
});

router.post("/submit/:sId/:tId", upload.none(), (request, response) => {
  const tId = request.params.tId;
  const sId = request.params.sId;
  const data = request.body;
  const { value = 0, result, discipline, multipleRes } = data;

  try {
    if (discipline === "PHYSICAL") {
      submitPhysicalTest(response, sId, tId, value, result, multipleRes); //final value = 0,result = all states,multiple results
    } else {
      submitChemicalTest(response, sId, tId, value, result);
    }
  } catch (e) {
    console.log("catch");
    return response.status(500).send({ err_message: "Internal server error" });
  }
});

//redundant route
router.get("/review/:sId/:tId", async (request, response) => {
  const { sId, tId } = request.params;

  try {
    const connection = await util.promisify(pool.getConnection).call(pool);

    await util.promisify(connection.beginTransaction).call(connection);

    const jobsQuery = `select o.due_date,mt.sample_id,om.quantity as qty,om.job_number as job_number , om.subgroup as subgroup_id,o.project_name,o.assigned_on,mt.test_id,mt.id as job_id,mt.status,s.name,t.test_name from material_test mt join order_material om on om.sample_id = mt.sample_id join orders o on o.order_id = om.order_id join test t on mt.test_id = t.id join subgroup s on s.id = om.subgroup  where mt.sample_id = ? and mt.test_id = ?`;

    const jobs = await util
      .promisify(connection.query)
      .call(connection, jobsQuery, [sId, tId]);
    return response.status(200).json(jobs[0]);
  } catch (err) {
    console.log(err);
    return response.status(500).json({ err_message: "Internal server error" });
  }
});

router.get("/myJobs/:sId/:tId", verifyToken, async (request, response) => {
  const username = request.user.username;
  const { sId, tId } = request.params;

  try {
    const connection = await util.promisify(pool.getConnection).call(pool);

    await util.promisify(connection.beginTransaction).call(connection);

    const empIdQuery = "SELECT emp_id FROM employee WHERE username = ?";
    const rows = await util
      .promisify(connection.query)
      .call(connection, empIdQuery, [username]);

    const empId = rows[0].emp_id;

    const jobsQuery = `select o.due_date,mt.sample_id,om.job_number,om.quantity as qty ,om.subgroup as subgroup_id,o.project_name,o.assigned_on,mt.test_id,mt.id as job_id,mt.status,s.name,t.test_name,t.discipline from material_test mt join order_material om on om.sample_id = mt.sample_id join orders o on o.order_id = om.order_id join test t on mt.test_id = t.id join subgroup s on s.id = om.subgroup  where assign_to = ? and mt.sample_id = ? and mt.test_id = ?`;

    const jobs = await util
      .promisify(connection.query)
      .call(connection, jobsQuery, [empId, sId, tId]);
    return response.status(200).json(jobs[0]);
  } catch (err) {
    console.log(err);
    return response.status(500).json({ err_message: "Internal server error" });
  }
});

router.get("/myJobs", verifyToken, async (request, response) => {
  const username = request.user.username;

  try {
    const connection = await util.promisify(pool.getConnection).call(pool);
    await util.promisify(connection.beginTransaction).call(connection);

    const empIdQuery = "SELECT emp_id FROM employee WHERE username = ?";
    const rows = await util
      .promisify(connection.query)
      .call(connection, empIdQuery, [username]);

    const empId = rows[0].emp_id;
    const jobsQuery = `select o.due_date,o.assigned_on,mt.sample_id,om.job_number,mt.test_id,mt.status,s.name,t.test_name from material_test mt join order_material om on om.sample_id = mt.sample_id join orders o on o.order_id = om.order_id join test t on mt.test_id = t.id join subgroup s on s.id = om.subgroup  where assign_to = ? and mt.status not in ('ACCEPTED', 'FINISHED') order by o.assigned_on asc, mt.status desc`;

    const jobs = await util
      .promisify(connection.query)
      .call(connection, jobsQuery, [empId]);

    return response.status(200).json(jobs);
  } catch (err) {
    return response.status(500).json({ err_message: "Internal server error" });
  }
});

module.exports = router;
