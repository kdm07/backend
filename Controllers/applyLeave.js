const pool = require("../config");

const applyLeave = async (emp_id, fromDate, toDate, subject, body) => {
  try {
    const updateLeaveQuery = `
        INSERT INTO leaves
        (emp_id,start_date,end_date,subject,reason ,applied_on ,reporting_manager_approval ,reporting_manager_approval_date ,hr_approval ,hr_approval_on ,reject)
        VALUES
        (?,?,?,?,?,?,?,?,?,?,?)`;

    const queryValues = [
      emp_id,
      fromDate,
      toDate,
      subject,
      body,
      new Date(),
      false,
      null,
      false,
      null,
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
