const AWS = require("aws-sdk");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
dotenv.config({ path: "aws.env" });

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

const transporter = nodemailer.createTransport({
  SES: { ses, aws: AWS },
});

const sendEmail = async (to, subject, message, cc = [], bcc = []) => {
  try {
    const info = await transporter.sendMail({
      from: "vikramreddy.annem@kdmengineers.com",
      to,
      cc: cc.length > 0 ? cc : undefined,
      bcc: bcc.length > 0 ? bcc : undefined,
      subject,
      text: message,
    });
    console.log("Email sent: ", info);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

const orderConformationMail = (receiptentMail, receiptentName) => {
  const subject = "Order conformation mail";
  const message = `
  Dear ${receiptentName},
  
  Congratulations! Your order has been placed successfully on ${new Date()}. 
  
  We are glad to inform you that your order is now being processed with the utmost care.
  `;

  return sendEmail(receiptentMail, subject, message);
};

const conformingLeaveAppliedMail = (
  employeeFullname,
  fromDate,
  to,
  mailTo,
  mailFrom
) => {
  const subject = "Leave Application";
  const message = `
  Dear Sir,
  
  Am requesting a leave ${fromDate} to ${to}. 
  
  Please Approve me a leave for 2 days 

  `;

  return sendEmail(mailTo, subject, message);
};

module.exports = { orderConformationMail, conformingLeaveAppliedMail };
