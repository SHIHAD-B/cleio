// authMiddleware.js
const User = require('../model/userdata');

const isAuthenticated = async (req, res, next) => {
    try {
        if (req.session.isauth) {
            const result = await User.findOne({ Email: req.session.user }, { _id: 0, Status: 1 });

            if (result) {
                const status = result.Status;


                if (status === 'blocked') {
                    req.session.isauth = false;
                    res.redirect('/');
                } else {

                    next();
                }
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

module.exports = isAuthenticated;
