// authenticated user.js

const authenticatedUser = (req, res, next) => {
    if (req.session.isauth) {

        res.redirect('/');
    } else {

        next();
    }
};

module.exports = authenticatedUser;