import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const SES_CONFIG = {
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  },
}

const sesClient = new SESClient(SES_CONFIG);

const createSendEmailCommand = (toAddress, fromAddress, messageBody) => {
  return new SendEmailCommand({
    Source: fromAddress,
    Destination: {
      CcAddresses: [/* more items */],
      ToAddresses: [toAddress],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: messageBody.html,
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: messageBody.subject,
      },
    },

    ReplyToAddresses: [/* more items */],
  });
};


class EmailService {
  constructor() {}

  static async send(toAddress, messageBody) {
    const sendEmailCommand = createSendEmailCommand(
      toAddress,
      process.env.ADMIN_EMAIL,
      messageBody,
    );
    try {
      return await sesClient.send(sendEmailCommand);
    } catch (err) {
      console.error("Failed to send email.");
    }
  };
}

export default EmailService;
