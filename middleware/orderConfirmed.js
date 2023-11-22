// authMiddleware order confirmed

const adfterOrder = (req, res, next) => {
    if (!req.session.afterorder) {

        next();
    } else {

        res.redirect('/home');
    }
};

module.exports = adfterOrder;