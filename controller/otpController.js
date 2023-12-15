const usersotpverifications = require('../model/otpverfication')
const Users = require('../model/userdata')
const wallet = require('../model/wallet')
const referral = require('../model/referal')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_SECRETPASS,
    },
});
//transaction id generator
function generateTransactionID() {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000000);
    const transactionID = `${timestamp}-${randomNum}`;
    return transactionID;
}
//referral code generator
function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }

    return referralCode;
}


generateReferralCode()

//otp page
async function getotp(req, res, next) {
    try {
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
    } catch (error) {
        console.log(error);
        return next(error)
    }

}


//post otp
const postotp = async (req, res, next) => {


    try {
        const first = req.body.digitone;
        const second = req.body.digittwo;
        const third = req.body.digitthree;
        const fourth = req.body.digitfour;
        const otpget = String(first + second + third + fourth);
        const useremail = req.session.userdetails.email;

        const otptocheck = await usersotpverifications.findOne({ user: useremail });


        if (otptocheck && otptocheck.otp == otpget) {
            const hashedPassword = bcrypt.hashSync(req.session.userdetails.password, 10);

            const newUser = new Users({
                Firstname: req.session.userdetails.firstname,
                Secondname: req.session.userdetails.secondname,
                Email: req.session.userdetails.email,
                Password: hashedPassword,
                Status: 'active',
                Role: 'user',
                referral_code: generateReferralCode(),
                Mobile: req.session.userdetails.phonenumber,
                isdeleted: false,
            });

            await newUser.save();

            if (req.session.userdetails.referral) {
                const referraldata = await referral.findOne();

                await Users.updateOne({ _id: req.session.inviter }, { referrals: { $push: { User: newUser._id } } })
                if (referraldata.Inviter_status == 'active') {

                    const existingWallet = await wallet.findOne({ User_id: req.session.inviter });
                    if (existingWallet) {
                        console.log(generateTransactionID());
                        await wallet.updateOne(
                            { User_id: req.session.inviter },
                            {
                                $set: { Account_balance: existingWallet.Account_balance + parseInt(referraldata.Inviter) },
                                $push: {
                                    Transactions: {
                                        Amount: referraldata.Inviter,
                                        Date: new Date(),
                                        Description: 'referral bonus',
                                        Transaction_id: generateTransactionID(),
                                        Transaction_type: 'credit'
                                    }
                                }
                            }
                        );
                    } else {

                        const newWallet = new wallet({
                            User_id: req.session.inviter,
                            Account_balance: parseInt(referraldata.Inviter),
                            Transactions: [{
                                Amount: referraldata.Inviter,
                                Date: new Date(),
                                Description: 'referral bonus',
                                Transaction_id: generateTransactionID(),
                                Transaction_type: 'credit'
                            }]
                        });
                        await newWallet.save();
                    }
                }
                if (referraldata.Referred_user_status == 'active') {

                    const newuserWallet = new wallet({
                        User_id: newUser._id,
                        Account_balance: parseInt(referraldata.Referred_user),
                        Transactions: [{
                            Amount: referraldata.Referred_user,
                            Date: new Date(),
                            Description: 'welcome referral bonus',
                            Transaction_id: generateTransactionID(),
                            Transaction_type: 'credit'
                        }]
                    });
                    await newuserWallet.save();
                }
            }
            if (req.session.inviter) {

                const refdetails = await Users.findOne({ _id: req.session.inviter })

                await referral.updateOne({}, {
                    $push: {
                        Activities: {
                            Date: new Date(),
                            Inviter: refdetails.Email,
                            Referred_user: req.session.userdetails.email,
                        }
                    }
                });
            }

            req.session.isauth = true;
            req.session.user = req.session.userdetails.email;
            res.json({ success: true });
        } else {
            req.session.isauth = false;
            res.status(401).json({ message: 'Incorrect OTP' });

        }

    } catch (error) {
        console.error('Error handling OTP verification:', error);
        return next(error)

    }
}

//forget-get-otp
function forgetgetotp(req, res, next) {
    try {
        const useremail = req.session.forgetemail;
        res.render('./user/forgetotp', { error: false, email: useremail })

    } catch (error) {
        console.log(error);
        return next(error)
    }
}

//forget-post-otp
const forgetotpcheck = async (req, res, next) => {
    try {

        const first = req.body.digitone;
        const second = req.body.digittwo;
        const third = req.body.digitthree;
        const fourth = req.body.digitfour;
        const otpget = String(first + second + third + fourth);
        const useremail = req.session.forgetemail;
        const otptocheck = await usersotpverifications.findOne({ user: useremail });

        if (otptocheck && otptocheck.otp == otpget) {
            req.session.user = useremail;
            req.session.isforget = true;
            req.session.isOtpPassed = true;

            res.json({ success: true });
        } else {

            req.session.isauth = false;
            return res.status(401).json({ message: 'Incorrect OTP' });
        }

    } catch (error) {
        console.error('Error handling OTP verification:', error);
        return next(error)
    }

}

const resetpasswordpage = async (req, res, next) => {
    try {
        if (req.session.isOtpPassed) {
            req.session.isOtpPassed = false;
            res.render('user/resetpassword');
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log(error);
        return next(error)
    }

}
module.exports = {
    getotp,
    postotp,
    forgetgetotp,
    forgetotpcheck,
    resetpasswordpage

}

