const pool = require("../config");

const submitPhysicalTest = async (
  response,
  sId,
  tId,
  value,
  result,
  multipleRes
) => {
  try {
    const sqlQuery =
      "UPDATE material_test SET status=?, submitted_on=?, test_result=?,dept = ?, test_details=?,report_values = ? WHERE sample_id=? AND test_id=?";
    const queryValues = [
      "FINISHED",
      new Date(),
      value,
      "PHYSICAL",
      result,
      multipleRes,
      sId,
      tId,
    ];

    const queryResult = await new Promise((resolve, reject) => {
      pool.query(sqlQuery, queryValues, (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (queryResult) {
      return response
        .status(200)
        .send({ message: "Job submitted successfully" });
    } else {
      return response
        .status(500)
        .send({ err_message: "Internal server error" });
    }
  } catch (error) {
    console.log("catch block in submit chemical test", error);
    return response.status(500).send({ err_message: "Internal server error" });
  }
};

module.exports = submitPhysicalTest;
