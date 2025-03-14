const FormData = require('form-data');
const Mailgun = require('mailgun.js');
const pool = require("../src/db.js");
const fs = require('fs');
const path = require('path');

// Initialize Mailgun client
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});

// Convert image to base64
const faviconPath = path.join(__dirname, '../assets/favicon.png');
const faviconBase64 = fs.readFileSync(faviconPath, { encoding: 'base64' });

// Email template generator
const generateEmailTemplate = (type, data) => {
  switch (type) {
    case 'unread_messages':
      return {
        subject: `ZotLease - ${data.unread_count} Unread Messages`,
        text: `Hey ${data.fname}, you have unread messages waiting for you.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <h1 style="color: #0066CC;">ZotLease</h1>
            <p>Hey ${data.fname}, you have unread messages waiting for you.</p>
            <p style="font-family: Arial, sans-serif">
              Best,<br>
              ZotLease Team
            </p>
            <a href="https://zotlease.org" 
               style="background-color: #0066CC; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px;">
              View Messages
            </a>
          </div>
        `
      };
  }
};

const sendEmail = async (userId, toEmail, templateType, templateData) => {
  try {
    const template = generateEmailTemplate(templateType, templateData);
    
    console.log('sending message...')
    const messageData = {
      from: `Zotlease <postmaster@zotlease.org>`,
      to: toEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
      /* inline: [{
        filename: 'logo.png',
        data: fs.readFileSync(path.join(__dirname, '../assets/favicon.png')),
        cid: 'logo'
      }] */
    };

    const data = await mg.messages.create("zotlease.org", messageData);
    console.log(data)
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

const sendUnreadMessagesNotification = async (userid, email, fname, unread_count) => {
  try {
    await sendEmail(
      userid,
      email,
      'unread_messages',
      { fname, unread_count }
    );
    /*const userQuery = `
      SELECT email, fname 
      FROM users 
      WHERE userid = $1
    `;
    const userResult = await pool.query(userQuery, [userid]);
    
    if (userResult.rows.length > 0) {
      const { email, fname } = userResult.rows[0];
      await sendEmail(
        userid,
        email,
        'unread_messages',
        { fname }
      );
    }*/
    return true;
  } catch (error) {
    console.error("Error in sendUnreadMessagesNotification:", error);
    return false;
  }
};

module.exports = {
  sendUnreadMessagesNotification
};