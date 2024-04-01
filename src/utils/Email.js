
// npm i nodemailer

import nodemailer from 'nodemailer';

// Send an email
const sendEmail = async (to, subject, body) => {

  const transporter = nodemailer.createTransport({
    // configure transporter
  });

  const mailOptions = {
    from: 'your@email.com',
    to: to,
    subject: subject,
    text: body
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;