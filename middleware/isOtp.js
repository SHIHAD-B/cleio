

// authMiddleware.js

const isOtpCheck = (req, res, next) => {
    if (req.session.isforget) {

        next();
    } else {

        res.redirect('/');
    }
};

module.exports = isOtpCheck;