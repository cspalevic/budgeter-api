const { getClient } = require("./connection.js");
const { BudgeterError } = require("lib/middleware/error");
const { getConfig } = require("config");

module.exports.sendEmail = async (req, to, subject, html) => {
   const client = getClient(req);

   try {
      const data = {
         to,
         subject,
         html,
         from: getConfig("SENDGRID_FROM_EMAIL"),
      };
      req.logger.info(`Sendgrid service: attempting to send email: To = ${to}, Subject = ${subject}`);
      const response = await client.send(data);
      req.logger.info("Sendgrid service: email response");
      req.logger.info(response);
   }
   catch(error) {
      throw new BudgeterError(400, "Downstream error: Sendgrid email error", error);
   }
};