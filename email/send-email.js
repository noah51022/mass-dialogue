require('dotenv').config(); 

const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;
const refreshToken = process.env.REFRESH_TOKEN;

// Initialize oAuth2Client with correct parameters
const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectURI);
oAuth2Client.setCredentials({ refresh_token: refreshToken });

async function sendMail() {
  try {
    // Generate a new access token using the refresh token
    const accessToken = await oAuth2Client.getAccessToken();

    // Configure Nodemailer with OAuth2 authentication
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'ethangreenhouse57@gmail.com', // Your email address
        clientId,
        clientSecret,
        refreshToken,
        accessToken: accessToken.token,
      },
    });

    // Email options
    const mailOptions = {
      from: 'Mass Dialogue <ethangreenhouse57@gmail.com>',
      to: 'ethangreenhouse57@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email from Mass Dialogue',
      html: '<h1>This is a test email from Mass Dialogue</h1>',
    };

    // Send email
    const result = await transport.sendMail(mailOptions);
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
}

// Execute the function
sendMail();