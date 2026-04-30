const nodemailer = require('nodemailer');

const getTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

exports.sendReply = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  
  const mailOptions = {
    from: `"${process.env.CONTACT_FROM_NAME || 'Soham Portfolio'}" <${process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: subject || 'Re: Your Inquiry - Soham Portfolio',
    text,
    html: html || text.replace(/\n/g, '<br>'),
  };

  return await transporter.sendMail(mailOptions);
};
