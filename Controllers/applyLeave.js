const pool = require("../config");

const applyLeave = async (emp_id, fromDate, toDate, subject, body) => {
  try {
    const updateLeaveQuery = `
        INSERT INTO leaves
        (emp_id,start_date,end_date,subject,reason ,applied_on ,reporting_manager_approval  ,hr_approval  ,reject)
        VALUES
        (?,?,?,?,?,?,?,?,?)`;

    const queryValues = [
      emp_id,
      fromDate.toISOString().substring(0, 10),
      toDate.toISOString().substring(0, 10),
      subject,
      body,
      new Date(),
      false,

      false,

      false,
    ];

    return await new Promise((resolve, reject) => {
      pool.query(updateLeaveQuery, queryValues, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (err) {
    throw err;
  }
};

module.exports = applyLeave;
