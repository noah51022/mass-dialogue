import 'dotenv/config';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

import { generateReport } from '../src/reportGenerator.js';

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;
const refreshToken = process.env.REFRESH_TOKEN;
const senderEmail = process.env.SENDER_EMAIL;

const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectURI);
oAuth2Client.setCredentials({ refresh_token: refreshToken });

async function sendMail(recipientList) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    
    const reportText = await generateReport(process.env.OPENAI_API_KEY);

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: senderEmail,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `Mass Dialogue <${senderEmail}>`,
      subject: 'Test Email',
      text: reportText,
    };

    for (const recipient of recipientList) {
      mailOptions.to = recipient;
      try {
        const result = await transport.sendMail(mailOptions);
        console.log(`Email sent successfully to ${recipient}:`, result);
      } catch (error) {
        console.error(`Error sending email to ${recipient}:`, error.message);
      }
    }

    console.log('All emails sent!');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

const recipientEnv = process.env.RECIPIENT_LIST;
if (!recipientEnv) {
  console.error('Missing RECIPIENT_LIST environment variable.');
  process.exit(1);
}
const recipients = recipientEnv.split(',').map(email => email.trim());

sendMail(recipients);