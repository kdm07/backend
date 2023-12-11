const pool = require("../config");

const submitChemicalTest = async (response, sId, tId, value, result) => {
  try {
    const sqlQuery =
      "UPDATE material_test SET status=?, submitted_on=?, test_result=?, test_details=? WHERE sample_id=? AND test_id=?";
    const queryValues = [
      "FINISHED",
      new Date(),
      parseFloat(value),
      result,
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

module.exports = submitChemicalTest;
