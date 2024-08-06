require('dotenv').config();

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(bodyParser.json());

// Middleware to set security headers
app.use((req, res, next) => {
  // Set Content Security Policy (CSP)
  res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'");
  // Set X-Content-Type-Options
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Set X-Frame-Options
  res.setHeader("X-Frame-Options", "DENY");
  // Set X-XSS-Protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});



// Define a route handler for the root URL
app.get('/', (req, res) => {
  // Send the contents of auth.html file
  res.sendFile(path.join(__dirname, 'public', 'cover.html'));
});

// Define a route handler for sending emails when ADMIN Assign
app.post('/send-email', (req, res) => {
  const userEmail = req.body.user_email; // Assuming userEmail is sent in the request body
  const nannyEmail = req.body.nanny_email;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEJS_GMAIL_APP_USER,
      pass: process.env.NODEJS_GMAIL_APP_PASSWORD
    }
  });

  // Mail options for the parent
  const parentMailOptions = {
    from: process.env.NODEJS_GMAIL_APP_USER,
    to: userEmail,
    subject: '🔥 Fairy Booking Confirmation 🔥',
    html: `
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
        <h1 style="color: #333;">Greetings!</h1>
        <p style="color: #666;">We are thrilled to inform you that your nanny has been successfully assigned!</p>
        <p style="color: #666;">Get ready for a hassle-free experience and say goodbye to chaos! Your Fairy is on the way!</p>
        <p style="color: #666;">To monitor the status of your booking just click the button below:</p>
        <a href="https://www.hrfairy.com" style="display: inline-block; background-color: #7c0c74; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Visit www.hrfairy.com</a>
        <p style="color: #666;">Best Regards,</p>
        <p style="color: #666;">HR Fairy 👩‍👧‍👦</p>
      </div>
    `
  };

  // Mail options for the nanny
  const nannyMailOptions = {
    from: process.env.NODEJS_GMAIL_APP_USER,
    to: nannyEmail,
    subject: '🔥 Nanny Assignment Notification 🔥',
    html: `
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
        <h1 style="color: #333;">Hello there!</h1>
        <p style="color: #666;">You have been assigned as a nanny!</p>
        <p style="color: #666;">Please get in touch with the parent for further details.</p>
        <p style="color: #666;">Best Regards,</p>
        <p style="color: #666;">HR Fairy 👩‍👧‍👦</p>
      </div>
    `
  };

  // Send email to the parent
  transporter.sendMail(parentMailOptions, (parentError, parentInfo) => {
    if (parentError) {
      console.error(parentError);
      res.status(500).json({ error: 'Parent email could not be sent' });
    } else {
      console.log('Parent Email sent: ' + parentInfo.response);
      // Send email to the nanny
      transporter.sendMail(nannyMailOptions, (nannyError, nannyInfo) => {
        if (nannyError) {
          console.error(nannyError);
          res.status(500).json({ error: 'Nanny email could not be sent' });
        } else {
          console.log('Nanny Email sent: ' + nannyInfo.response);
          res.status(200).json({ message: 'Emails sent successfully' });
        }
      });
    }
  });
});


// Define a route handler for sending emails when ADMIN Assign
app.post('/accept-email', (req, res) => {
  const parentEmail = req.body.parentEmail; // Assuming userEmail is sent in the request body
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEJS_GMAIL_APP_USER,
      pass: process.env.NODEJS_GMAIL_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.NODEJS_GMAIL_APP_USER,
    to: parentEmail,
    subject: '🔥 Fairy Booking Confirmation 🔥',
    html: `
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
        <h1 style="color: #333;">Greetings!</h1>
        <p style="color: #666;">We're delighted to inform you that your Fairy has accepted your booking!</p>
        <p style="color: #666;">You can now chat with your Fairy in the app to discuss any details or special requests you may have.</p>
        <p style="color: #666;">To monitor the status of your booking just click the button below:</p>
        <a href="https://www.hrfairy.com" style="display: inline-block; background-color: #7c0c74; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Visit www.hrfairy.com</a>
        <p style="color: #666;">Best Regards,</p>
        <p style="color: #666;">HR Fairy 👩‍👧‍👦</p>
        
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Email could not be sent' });
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});

// Define a route handler for sending emails when ADMIN Assign
app.post('/deny-email', (req, res) => {
  const bookingEmail = req.body.email; // Assuming userEmail is sent in the request body
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEJS_GMAIL_APP_USER,
      pass: process.env.NODEJS_GMAIL_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.NODEJS_GMAIL_APP_USER,
    to: bookingEmail,
    subject: '🔥 Fairy Booking Confirmation 🔥',
    html: `
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
        <h1 style="color: #333;">Hello,</h1>
        <p style="color: #666;">We regret to inform you that the nanny assigned to you did not accept the booking.</p>
        <p style="color: #666;">Our team is working diligently to reassign another nanny to fulfill your booking request.</p>
        <p style="color: #666;">Rest assured, we are committed to providing you with a suitable nanny for your needs. </p>
        <p style="color: #666;">We will notify you once a new nanny has been assigned to your booking.</p>
        <p style="color: #666;">To monitor the status of your booking just click the button below:</p>
        <a href="https://www.hrfairy.com" style="display: inline-block; background-color: #7c0c74; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Visit www.hrfairy.com</a>
        <p style="color: #666;">Best Regards,</p>
        <p style="color: #666;">HR Fairy 👩‍👧‍👦</p>
        
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Email could not be sent' });
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
