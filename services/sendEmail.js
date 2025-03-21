const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service : 'email',
        host : process.env.USER_HOST,
        port : process.env.USER_PORT,
        auth : {
            user : process.env.USER_EMAIL,
            pass : process.env.USER_PASS
        }
    })
    const mailOptions = {
        from : "sijan giri <girisijan346@gmail.com>",
        to : options.email,
        subject : options.subject,
        text : options.text
    }
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail