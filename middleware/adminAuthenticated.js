// authMiddleware admin

const adminAuthenticated = (req, res, next) => {
    if (req.session.isadmin) {

        next();
    } else {

        res.redirect('/admin');
    }
};

module.exports = adminAuthenticated;