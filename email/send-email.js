import 'dotenv/config'; // Use import for dotenv
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

import { generateReport } from '../src/reportGenerator.js'; // Updated path

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;
const refreshToken = process.env.REFRESH_TOKEN;

// Initialize oAuth2Client with correct parameters
const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectURI);
oAuth2Client.setCredentials({ refresh_token: refreshToken });

async function sendMail(recipientList) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    
    // Generate the report
    const reportText = await generateReport(process.env.OPENAI_API_KEY);

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'ethangreenhouse57@gmail.com', // Your email address
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken.token,
      },
    });

    // Email options - common for all recipients
    const mailOptions = {
      from: 'Mass Dialogue <ethangreenhouse57@gmail.com>',
      subject: 'Test Email',
      text: reportText, // Use the generated report text
      //html: '<h1>This is a test email from Mass Dialogue</h1>',
    };

    // Iterate over the recipient list and send emails
    for (const recipient of recipientList) {
      mailOptions.to = recipient; // Set recipient address
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

// Example usage:
const recipients = [
  'ethangreenhouse57@gmail.com',
  'ethangreenhouse57+1@gmail.com',
];

sendMail(recipients);