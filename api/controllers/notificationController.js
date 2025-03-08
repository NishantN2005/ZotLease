const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const pool = require("../src/db.js");
const {SES_FROM_EMAIL} = require("../constants.js");
const fs = require('fs');
const path = require('path');

// Configure SES Client
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
// Convert image to base64
const faviconPath = path.join(__dirname, '../assets/favicon.png');
const faviconBase64 = fs.readFileSync(faviconPath, { encoding: 'base64' });

// Email template generator
const generateEmailTemplate = (type, data) => {
  switch (type) {
    case 'unread_messages':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: #0066CC; padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
            <h1 style="color: white; font-size: 24px; margin: 0;">ZotLease</h1>
          </div>
          <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 16px;">New Messages</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
              Hey ${data.fname}, you have unread messages waiting for you.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://zotlease.org" 
                 style="background-color: #0066CC; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                View Messages
              </a>
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
                <img src="data:image/png;base64,${faviconBase64}" 
                    alt="ZotLease Logo" 
                    style="width: 50px; height: 50px; margin-bottom: 12px;"
                />
            </div>
          </div>
        </div>
      `;
  }
};

// Send email using SES
const sendEmail = async (userId, toEmail, subject, htmlContent) => {
  try {
    // Check last notification time
    const lastNotificationQuery = `
      SELECT last_notification_sent 
      FROM users 
      WHERE userid = $1
    `;
    const result = await pool.query(lastNotificationQuery, [userId]);
    
    if (!result.rows.length) {
      throw new Error('User not found');
    }

    const lastNotification = result.rows[0].last_notification_sent;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check if 24 hours have passed
    if (lastNotification && new Date(lastNotification) > twentyFourHoursAgo) {
      console.log(`Skipping notification for user ${userId} - too recent`);
      return false;
    }

    // Send email via SES
    const params = {
      Source: SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: "UTF-8",
          },
        },
      },
    };

    await sesClient.send(new SendEmailCommand(params));

    // Update last notification timestamp
    const updateQuery = `
      UPDATE users 
      SET last_notification_sent = NOW() 
      WHERE userid = $1
    `;
    await pool.query(updateQuery, [userId]);

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// Controller methods
const sendUnreadMessagesNotification = async (userid) => {
  try {
    const userQuery = `
    SELECT email, fname 
    FROM users 
    WHERE userid = $1
    `;
    const userResult = await pool.query(userQuery, [userid]);
    
    if (userResult.rows.length > 0) {
    const { email, fname } = userResult.rows[0];
    const htmlContent = generateEmailTemplate('unread_messages', {
        fname: fname
    });
    
    await sendEmail(
        userid,
        email,
        "New Messages on ZotLease",
        htmlContent
    );
    }
    return true;
  } catch (error) {
    console.error("Error in sendUnreadMessagesNotification:", error);
    return false;
  }
};

module.exports = {
    sendUnreadMessagesNotification,
  // Add other notification methods as needed
};