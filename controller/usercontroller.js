
const banner = require('../model/banner')
const validator = require('validator');
const coupon = require('../model/coupon')
const products = require('../model/product')
const nodemailer = require('nodemailer');
const Users = require('../model/userdata')
const usersotpverifications = require('../model/otpverfication')
const bcrypt = require('bcrypt');
const fs = require('fs');
const Category = require('../model/category');
const product_offer = require('../model/productoffer')
const category_offer = require('../model/categoryoffer')
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_SECRETPASS,
    },
});




//default home
const defaultlanding = async (req, res, next) => {
    try {

        if (req.session.isauth) {
            const coupons = await coupon.find();
            const data = await products.find();
            const bannerData = await banner.find()
            res.render('./user/home', { data: data, coupons: coupons, bannerData: bannerData })
        } else {
            res.render('./user/landing')
        }
    } catch (error) {
        return next(error)
    }
}


//login page
function getlogin(req, res, next) {
    try {
        res.render('./user/login', { error: false })

    } catch (error) {
        console.log(error);
        return next(error)
    }
}



//post login
const postlogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;


        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const user = await Users.findOne({ Email: email });

        if (user) {
            if (user.Status === 'active' && user.Role === 'user' && bcrypt.compareSync(password, user.Password)) {
                req.session.user = email;
                req.session.isauth = true;
                return res.json({ success: true, isAdmin: false });
            } else if (user.Status === 'blocked') {
                return res.status(401).json({ message: 'User is blocked' });
            } else {
                return res.status(401).json({ message: 'Incorrect password' });
            }
        } else {
            return res.status(401).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error handling login:', error);
        return next(error);
    }
};


//signup page
function getsignup(req, res, next) {
    try {

        res.render('./user/signup', { error: false })
    } catch (error) {
        console.log(error);
        return next(error)
    }
}


//post signup
const postsignup = async (req, res, next) => {
    try {
        const { email, phonenumber, referral, Firstname, Secondname } = req.body;

        if (email && !validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (phonenumber && !validator.isMobilePhone(phonenumber, 'any', { strictMode: false })) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        if (Firstname && !validator.isAlpha(Firstname)) {
            return res.status(400).json({ message: 'Invalid characters in Firstname' });
        }

        if (Secondname && !validator.isAlpha(Secondname)) {
            return res.status(400).json({ message: 'Invalid characters in Secondname' });
        }

        const data = await Users.findOne({ Email: email });
        const dataphone = await Users.findOne({ Mobile: phonenumber });

        if (data) {
            return res.status(401).json({ message: 'Email already exists' });
        } else if (dataphone) {
            return res.status(401).json({ message: 'Phone number already exists' });
        } else if (referral) {
            const ref = await Users.findOne({ referral_code: referral });

            if (!ref) {
                return res.status(401).json({ message: 'Invalid referral code' });
            }

            req.session.inviter = ref._id;
            req.session.userdetails = req.body;
            req.session.otpemail = email;

            return res.json({ success: true });
        } else {
            req.session.userdetails = req.body;
            req.session.otpemail = email;

            return res.json({ success: true });
        }
    } catch (error) {
        console.error('Error handling signup:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};





//home page
const home = async (req, res, next) => {
    try {

        res.render('./user/landing',)

    } catch (error) {
        console.log(error);
        return next(error)
    }

}


//logout
function logout(req, res, next) {
    try {
        req.session.user = false;
        req.session.userdetails = false;
        req.session.isauth = false;
        req.session.otpemail = false;
        req.session.afterorder = false;
        req.session.buyNowProductid = false;
        req.session.product_color = false;
        req.session.product_size = false;
        req.session.otpemail = false;
        req.session.forgetemail = false;
        req.session.isforget = false;
        req.session.isOtpPassed = false;
        req.session.buyNowProductid = false;
        res.redirect('/');
    } catch (error) {
        console.log(error);
        return next(error)
    }
}


//forgotpage
function forgotpassword(req, res, next) {
    try {
        res.render('./user/forgotpassword')

    } catch (error) {
        console.log(error);
        return next(error)
    }
}
//resetpasswordpage
function resetpassword(req, res, next) {
    try {
        res.render('./user/resetpassword')

    } catch (error) {
        console.log(error);
        return next(error)
    }
}



//postforgetpoassword
const postforgetpasswordotp = async (req, res, next) => {
    try {
        req.session.forgetemail = req.body.email
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`.toString();
        const existingOtpVerification = await usersotpverifications.findOne({ user: req.body.email });

        if (existingOtpVerification) {
            existingOtpVerification.otp = otp;
            existingOtpVerification.createdAt = new Date();
            existingOtpVerification.expiresdAt = new Date(Date.now() + 5 * 60 * 1000);
            await existingOtpVerification.save();
        } else {
            const newOtpVerification = new usersotpverifications({
                user: req.body.email,
                otp: otp,
                createdAt: new Date(),
                expiresdAt: new Date(Date.now() + 15 * 60 * 1000),
            });
            await newOtpVerification.save();
        }
        const resetPasswordEmail = `
            <p>Hello,</p>
            <p>You have requested a password reset.</p>
            <p>Your OTP code to reset your password is: <strong>${otp}</strong></p>
            <p>If you did not make this request, please ignore this email.</p>
            <p>Thank you.</p>
          `;

        const info = await transporter.sendMail({
            from: 'adclieo122@gmail.com',
            to: req.body.email,
            subject: "Password Reset OTP",
            html: resetPasswordEmail,
        });

        console.log('Message sent: %s', info.messageId);

        res.redirect('/forgetotp');
    } catch (error) {
        console.error('Error handling signup:', error);
        return next(error)
    }
}


//newpassword(forgot)
const resetpasswordpost = async (req, res, next) => {
    try {
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        await Users.updateOne({ Email: req.session.forgetemail }, { $set: { Password: hashedPassword } })
        req.session.user = req.session.forgetemail;
        req.session.isauth = true;
        res.redirect('/')

    } catch (error) {
        console.log(error);
        return next(error)
    }
}

//product page
const ITEMS_PER_PAGE = 8;

const productpage = async (req, res, next) => {
    try {


        const coupons = await coupon.find();
        const categories = await Category.find();
        const brand = await products.distinct("Specification.0.brand");
        const currentPage = req.query.page || 1;
        const currentDate = new Date();

        if (req.query.search) {
            const searchRegex = new RegExp(escapeRegex(req.query.search), 'i');
            const searchData = await products.find({
                isdeleted: false,
                $or: [
                    { 'Name': searchRegex },
                    { 'Description': searchRegex },
                ],
            }).populate("product_offer").populate("category_offer")
                .skip((currentPage - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);

            const totalProducts = await products.countDocuments({
                isdeleted: false,
                $or: [
                    { 'Name': searchRegex },
                    { 'Description': searchRegex },
                ],
            });
            const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

            res.render('./user/auth_product_select', {
                data: searchData,
                categories: categories,
                brand: brand,
                totalPages: totalPages,
                currentPage: currentPage
                , coupons: coupons
            });
        } else {
            const data = await products.find({ isdeleted: false })
                .populate({
                    path: "product_offer",
                    match: { Starts_at: { $lte: currentDate }, Expires_at: { $gte: currentDate } }
                })
                .populate({
                    path: "category_offer",
                    match: { Starts_at: { $lte: currentDate }, Ends_at: { $gte: currentDate } }
                })
                .skip((currentPage - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)

            const totalProducts = await products.countDocuments({ isdeleted: false });
            const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
            // res.json(data)

            res.render('./user/auth_product_select', {
                data: data,
                categories: categories,
                brand: brand,
                totalPages: totalPages,
                currentPage: currentPage
                , coupons: coupons
            });

        }
    } catch (error) {
        console.error('Error in productpage controller:', error);
        return next(error)
    }
};

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}



//product search
const productSearch = async (req, res, next) => {
    try {

        const searchTerm = req.query.term;

        const regex = new RegExp(searchTerm, 'i');

        const matchingProducts = await products.find({
            isdeleted: false,
            $or: [
                { 'Name': regex },
                { 'Description': regex },
            ],
        });

        if (!matchingProducts || matchingProducts.length === 0) {
            return res.json({ message: 'No matching products found' });
        }


        const PAGE_SIZE = 10;
        const page = req.query.page || 1;

        const startIndex = (page - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;

        const paginatedProducts = matchingProducts.slice(startIndex, endIndex);

        res.json(paginatedProducts);
    } catch (error) {
        console.error('Error in product search:', error);
        return next(error)
    }
};



//product detail
const productdetails = async (req, res, next) => {
    try {
        const coupons = await coupon.find();
        const id = req.params.id;
        const currentDate = new Date();
        const data = await products.find({ _id: id })
            .populate({
                path: "product_offer",
                match: { Starts_at: { $lte: currentDate }, Expires_at: { $gte: currentDate } }
            })
            .populate({
                path: "category_offer",
                match: { Starts_at: { $lte: currentDate }, Ends_at: { $gte: currentDate } }
            })
        res.render('./user/product_details', { data: data, mainimage: data[0].Image[0].Main, coupons: coupons })

    } catch (error) {
        console.log(error);
        return next(error)
    }
}
const sideimageone = async (req, res, next) => {
    try {
        const coupons = await coupon.find();
        const id = req.params.id;
        const data = await products.find({ _id: id })
        res.render('./user/product_details', { data: data, mainimage: data[0].Image[0].Main, coupons: coupons })

    } catch (error) {
        console.log(error);
        return next(error)
    }
}
const sideimagetwo = async (req, res, next) => {
    try {
        const coupons = await coupon.find();
        const id = req.params.id;
        const data = await products.find({ _id: id })
        res.render('./user/product_details', { data: data, mainimage: data[0].Image[0].Child_one, coupons: coupons })

    } catch (error) {
        console.log(error);
        return next(error)
    }
}

const sideimagethree = async (req, res, next) => {
    try {
        const coupons = await coupon.find();
        const id = req.params.id;
        const data = await products.find({ _id: id })
        res.render('./user/product_details', { data: data, mainimage: data[0].Image[0].Child_two, coupons: coupons })

    } catch (error) {
        console.log(error);
        return next(error)
    }
}
const sideimagefour = async (req, res, next) => {
    try {
        const coupons = await coupon.find();
        const id = req.params.id;
        const data = await products.find({ _id: id })
        res.render('./user/product_details', { data: data, mainimage: data[0].Image[0].Child_three, coupons: coupons })

    } catch (error) {
        console.log(error);
        return next(error)
    }
}

//deleting expired otp
const deleteExpiredOTP = async () => {
    try {

        const currentDate = new Date();
        await usersotpverifications.deleteMany({ expiresdAt: { $lte: currentDate } });

        setTimeout(deleteExpiredOTP, 30 * 1000);

    } catch (error) {
        console.error('Error deleting expired OTPs:', error);
    }
};


//user profile
const profile = async (req, res, next) => {
    try {
        const coupons = await coupon.find();
        const user = await Users.findOne({ Email: req.session.user })

        res.render('./user/profile', { user: user, coupons: coupons })

    } catch (error) {
        console.log(error);
        return next(error)
    }

}
//edit profile
const editprofile = async (req, res, next) => {
    try {
        const coupons = await coupon.find();
        const user = await Users.findOne({ Email: req.session.user })
        res.render('./user/editprofile', { profile: false, user: user, coupons: coupons })

    } catch (error) {
        console.log(error);
        return next(error)
    }
}

//change password
const changePassword = async (req, res, next) => {
    try {

        const { currentpassword, newpassword } = req.body;
        const user = await Users.findOne({ Email: req.session.user });
        let hashedNewPassword;

        const isPasswordMatch = await bcrypt.compare(currentpassword, user.Password);

        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        } else if (currentpassword === newpassword) {
            return res.status(400).json({ error1: "Can't change to the same password" });
        } else {
            hashedNewPassword = bcrypt.hashSync(newpassword, 10);

            await Users.updateOne({ Email: req.session.user }, {
                $set: {
                    Password: hashedNewPassword
                }
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.log(error);
        return next(error)
    }

};

// edit profile
const posteditProfile = async (req, res, next) => {

    try {


        const { firstname, secondname, phone } = req.body;
        const user = await Users.findOne({ Email: req.session.user });

        await Users.updateOne({ Email: req.session.user }, {
            $set: {
                Firstname: firstname,
                Secondname: secondname,
                Mobile: phone
            }
        });

        if (req.files.length) {
            if (user.Profile) {
                try {
                    fs.unlinkSync("Public" + user.Profile);
                } catch (err) {
                    console.error("Error deleting file:", err);
                }

            }

            await Users.updateOne({ Email: req.session.user }, {
                $set: {
                    Profile: "/productimage/" + req.files[0].filename,
                }
            });
        }

        res.json({ success: true, img: "/productimage/" + req.files[0].filename });
    } catch (error) {
        console.log(error);
        return next(error)
    }

};
//submission issue edit profile
const preventedit = async (req, res, next) => {
    try {
        const userwith = await Users.findOne({ Email: req.session.user });
        res.render('./user/editprofile', { user: userwith, profile: true });

    } catch (error) {
        console.log(error);
        return next(error)
    }
}










module.exports = {
    defaultlanding,
    getlogin, getsignup,
    postsignup,
    postlogin,
    home,
    logout,
    sideimageone,
    sideimagetwo,
    sideimagethree,
    sideimagefour,
    forgotpassword,
    resetpassword,
    postforgetpasswordotp,
    resetpasswordpost,
    productpage,
    productdetails,
    deleteExpiredOTP,
    editprofile,
    profile,
    changePassword,
    posteditProfile,
    preventedit,
    productSearch,

}