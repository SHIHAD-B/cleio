
const admin = require('../model/admindata')
const coupon = require('../model/coupon')
const products = require('../model/product')
const nodemailer = require('nodemailer');
const Users = require('../model/userdata')
const usersotpverifications = require('../model/otpverfication')
const bcrypt = require('bcrypt');
const fs = require('fs');
const Category = require('../model/category');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_SECRETPASS,
    },
});




//default home
const defaultlanding = async (req, res) => {
    if (req.session.isauth) {
        const coupons = await coupon.find();
        const data = await products.find();

        res.render('./user/home', { data: data, coupons: coupons })
    } else if (req.session.isadmin) {
        res.redirect('/admin')
    } else {
        res.render('./user/landing')
    }
}


//login page
function getlogin(req, res) {
    res.render('./user/login', { error: false })
}



//post login
const postlogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await Users.findOne({ Email: email });
    const adminUser = await admin.findOne({ email: email });
    if (user) {
        if (user.Status === "active" && user.Role === "user" && bcrypt.compareSync(password, user.Password)) {
            req.session.user = email;
            req.session.isauth = true;
            res.json({ success: true, isAdmin: false });
        } else if (user.Status === "blocked") {
            res.status(401).json({ message: "User is blocked" });
        } else {
            res.status(401).json({ message: "Incorrect password" });
        }
    } else if (adminUser && adminUser.password === password) {
        req.session.admin = email;
        req.session.isadmin = true;
        res.json({ success: true, isAdmin: true });
    } else if (adminUser && adminUser.password !== password) {
        res.status(401).json({ message: "incorrect password" })
    }
    else {
        res.status(401).json({ message: "User not found" });
    }
};



//signup page
function getsignup(req, res) {
    res.render('./user/signup', { error: false })
}


//post signup
const postsignup = async (req, res) => {
    const data = await Users.findOne({ Email: req.body.email })
    const dataphone = await Users.findOne({ Mobile: req.body.phonenumber })
    if (data) {
        res.render('./user/signup', { error: "Email already exists" })
    } else if (dataphone) {
        res.render('./user/signup', { error: "Phone number already exists" })
    }
    else {

        req.session.userdetails = req.body;
        try {


            req.session.otpemail = req.body.email;

            res.redirect('/verify-otp');
        } catch (error) {
            console.error('Error handling signup:', error);
            res.status(500).send('Internal Server Error');

        }
    }

}




//home page
const home = (req, res) => {
    res.render('./user/landing')

}


//logout
function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
}


//forgotpage
function forgotpassword(req, res) {
    res.render('./user/forgotpassword')
}
//resetpasswordpage
function resetpassword(req, res) {
    res.render('./user/resetpassword')
}



//postforgetpoassword
const postforgetpasswordotp = async (req, res) => {
    req.session.forgetemail = req.body.email
    try {
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
        res.status(500).send('Internal Server Error');
    }
}


//newpassword(forgot)
const resetpasswordpost = async (req, res) => {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    await Users.updateOne({ Email: req.session.forgetemail }, { $set: { Password: hashedPassword } })
    req.session.user = req.session.forgetemail;
    req.session.isauth = true;
    res.redirect('/')
}

//product page
const ITEMS_PER_PAGE = 8;

const productpage = async (req, res) => {
    try {
        const coupons = await coupon.find();
        const categories = await Category.find();
        const brand = await products.distinct("Specification.0.brand");
        const currentPage = req.query.page || 1;

        if (req.query.search) {
            const searchRegex = new RegExp(escapeRegex(req.query.search), 'i');
            const searchData = await products.find({
                isdeleted: false,
                $or: [
                    { 'Name': searchRegex },
                    { 'Description': searchRegex },
                ],
            })
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
                .skip((currentPage - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);

            const totalProducts = await products.countDocuments({ isdeleted: false });
            const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);


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
        res.status(500).send('Internal Server Error');
    }
};

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}



//product search
const productSearch = async (req, res) => {
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
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



//product detail
const productdetails = async (req, res) => {
    const coupons = await coupon.find();
    const id = req.params.id;
    const data = await products.find({ _id: id })
    res.render('./user/product_details', { data: data, mainimage: data[0].Image[0].Main, coupons: coupons })
}
const sideimageone = async (req, res) => {
    const coupons = await coupon.find();
    const id = req.params.id;
    const data = await products.find({ _id: id })
    res.render('./user/product_details', { data: data, mainimage: data[0].Image[0].Main, coupons: coupons })
}
const sideimagetwo = async (req, res) => {
    const coupons = await coupon.find();
    const id = req.params.id;
    const data = await products.find({ _id: id })
    res.render('./user/product_details', { data: data, mainimage: data[0].Image[0].Child_one, coupons: coupons })
}

const sideimagethree = async (req, res) => {
    const coupons = await coupon.find();
    const id = req.params.id;
    const data = await products.find({ _id: id })
    res.render('./user/product_details', { data: data, mainimage: data[0].Image[0].Child_two, coupons: coupons })
}
const sideimagefour = async (req, res) => {
    const coupons = await coupon.find();
    const id = req.params.id;
    const data = await products.find({ _id: id })
    res.render('./user/product_details', { data: data, mainimage: data[0].Image[0].Child_three, coupons: coupons })
}

//deleting expired otp
const deleteExpiredOTP = async () => {
    try {

        const currentDate = new Date();
        await usersotpverifications.deleteMany({ expiresdAt: { $lte: currentDate } });
        console.log('Expired OTPs deleted.');
        setTimeout(deleteExpiredOTP, 30 * 1000);

    } catch (error) {
        console.error('Error deleting expired OTPs:', error);
    }
};


//user profile
const profile = async (req, res) => {

    const coupons = await coupon.find();
    const user = await Users.findOne({ Email: req.session.user })

    res.render('./user/profile', { user: user, coupons: coupons })

}
//edit profile
const editprofile = async (req, res) => {
    const coupons = await coupon.find();
    const user = await Users.findOne({ Email: req.session.user })
    res.render('./user/editprofile', { profile: false, user: user, coupons: coupons })
}

//change password
const changePassword = async (req, res) => {

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

};

// edit profile
const posteditProfile = async (req, res) => {
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

        try {
            fs.unlinkSync("Public" + user.Profile);
        } catch (err) {
            console.error("Error deleting file:", err);
        }

        await Users.updateOne({ Email: req.session.user }, {
            $set: {
                Profile: "/productimage/" + req.files[0].filename,
            }
        });
    }

    res.redirect('/user/editprofile-success');

};
//submission issue edit profile
const preventedit = async (req, res) => {

    const userwith = await Users.findOne({ Email: req.session.user });
    res.render('./user/editprofile', { user: userwith, profile: true });
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