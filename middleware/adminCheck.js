// authMiddleware admin

const admincheck = (req, res, next) => {
    if (req.session.isadmin) {

        res.redirect('/admin');
    } else {

        next();
    }
};

module.exports = admincheck;