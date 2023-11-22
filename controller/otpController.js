const usersotpverifications = require('../model/otpverfication')
const Users = require('../model/userdata')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_SECRETPASS,
    },
});
//otp page
async function getotp(req, res) {
    if (req.session.otpemail) {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`.toString();
        const otpEmail = `
        <p>Hello,</p>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>Please use this OTP code to verify your identity.</p>
        <p>Thank you.</p>
      `;

        const info = await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: req.session.otpemail,
            subject: "Your OTP Code",
            html: otpEmail,
        });
        const existingOtpVerification = await usersotpverifications.findOne({ user: req.session.otpemail });

        if (existingOtpVerification) {
            existingOtpVerification.otp = otp;
            existingOtpVerification.createdAt = new Date();
            existingOtpVerification.expiresdAt = new Date(Date.now() + 1 * 60 * 1000);
            await existingOtpVerification.save();
        } else {
            const newOtpVerification = new usersotpverifications({
                user: req.session.otpemail,
                otp: otp,
                createdAt: new Date(),
                expiresdAt: new Date(Date.now() + 1 * 60 * 1000),
            });
            await newOtpVerification.save();
        }

        console.log('Message sent: %s', info.messageId);
        res.render('./user/otp', { error: false })
    } else {
        res.redirect('/')
    }
}


//post otp
const postotp = async (req, res) => {

    const first = req.body.digitone;
    const second = req.body.digittwo;
    const third = req.body.digitthree;
    const fourth = req.body.digitfour;
    const otpget = String(first + second + third + fourth);

    try {
        const useremail = req.session.userdetails.email;
        console.log(useremail);
        const otptocheck = await usersotpverifications.findOne({ user: useremail });
        console.log(otptocheck);
        if (otptocheck && otptocheck.otp == otpget) {
            const hashedPassword = bcrypt.hashSync(req.session.userdetails.password, 10);
            const newUser = new Users({
                Firstname: req.session.userdetails.firstname,
                Secondname: req.session.userdetails.secondname,
                Email: req.session.userdetails.email,
                Password: hashedPassword,
                Status: 'active',
                Role: 'user',
                Mobile: req.session.userdetails.phonenumber,
                isdeleted: false,
            });

            await newUser.save();

            req.session.isauth = true;
            req.session.user = req.session.userdetails.email;
            res.redirect('/')
        } else {
            req.session.isauth = false;
            res.render('./user/otp', { error: 'Incorrect OTP' });
        }

    } catch (error) {
        console.error('Error handling OTP verification:', error);
        res.status(500).send('Internal Server Error');

    }
}

//forget-get-otp
function forgetgetotp(req, res) {
    const useremail = req.session.forgetemail;
    res.render('./user/forgetotp', { error: false, email: useremail })
}

//forget-post-otp
const forgetotpcheck = async (req, res) => {

    const first = req.body.digitone;
    const second = req.body.digittwo;
    const third = req.body.digitthree;
    const fourth = req.body.digitfour;
    const otpget = String(first + second + third + fourth);
    const useremail = req.session.forgetemail;
    console.log(useremail);
    try {
        const otptocheck = await usersotpverifications.findOne({ user: useremail });

        if (otptocheck && otptocheck.otp == otpget) {
            req.session.user = useremail;
            req.session.isforget = true;
            res.render('./user/resetpassword');
        } else {
            req.session.isauth = false;
            res.render('./user/forgetotp', { error: 'Incorrect OTP', email: useremail })
        }

    } catch (error) {
        console.error('Error handling OTP verification:', error);
        res.status(500).send('Internal Server Error');
    }

}
module.exports = {
    getotp,
    postotp,
    forgetgetotp,
    forgetotpcheck

}

