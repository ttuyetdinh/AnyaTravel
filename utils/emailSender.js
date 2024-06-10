const nodeMailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const sendEmail = async (options) => {
    const myOAuth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
    myOAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    const accessToken = (await myOAuth2Client.getAccessToken())?.token;

    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.HOST_MAIL_ADDRESS,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken,
        },
    });

    const mailOptions = {
        from: `AnyaTtravel - ${process.env.HOST_MAIL_ADDRESS}`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Failed to send email: ${error}`);
        throw error;
    }
};

module.exports = sendEmail;
