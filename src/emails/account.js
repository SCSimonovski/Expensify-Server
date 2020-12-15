const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  const msg = {
    to: email,
    from: "simonovski132@gmail.com",
    subject: "Thanks for joining us!",
    text: `Welcome to our site, ${name}`,
  };
  sgMail.send(msg);
};

const sendCancelationEmail = (email, name) => {
  const msg = {
    to: email,
    from: "simonovski132@gmail.com",
    subject: "Sorry to see you go!",
    text: `Goodbye, ${name}. I hope to see you back sometime soon.`,
  };
  sgMail.send(msg);
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
