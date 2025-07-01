const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html, next) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
        });

        const mailOptions = {
            from: process.env.MAIL_USER,
            to,
            subject,
            html,
        };
        
        await transporter.sendMail(mailOptions);
        // console.log("email sent successfully.");
    
  } catch (err) {
        // console.error("Email sending error:", err);
        const error = new Error("Failed to send email");
        error.status = 500;
        return next(error);
  }
};

module.exports = sendEmail;