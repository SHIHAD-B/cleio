const admin = require('../model/admindata');
const bcrypt = require('bcrypt');
//admin mangement page
const adminManagement = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        if (req.session.superadmin) {

            const adminData = await admin.find({ role: "admin" })

            res.render('./admin/adminManagement', { adminData: adminData, superadmin: superadmin })
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        return next(error)
    }
}

//add admin
const addAdmin = async (req, res, next) => {
    try {
        const email = req.body.email;
        const existingAdmin = await admin.findOne({ email: email })
        if (existingAdmin) {
            res.status(401).json({ message: "Admin already exist" });
        } else {
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            const newAdmin = new admin({
                email: email,
                name: req.body.name,
                role: req.body.role,
                authority: req.body.authority,
                status: req.body.status,
                password: hashedPassword
            })
            await newAdmin.save();
            res.json({ success: true });
        }

    } catch (error) {
        return next(error)
    }
}

//edit admin
const editAdmin = async (req, res, next) => {
    try {

        let updateObject = {
            email: req.body.email,
            name: req.body.name,
            role: req.body.role,
            authority: req.body.authority,
            status: req.body.status,
        };


        if (req.body.password && req.body.password.length > 0) {

            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            updateObject.password = hashedPassword;
        }

        await admin.updateOne({ email: req.body.email }, { $set: updateObject });

        res.json({ success: true });

    } catch (error) {
        return next(error);
    }
};

//admin block
const adminBlock = async (req, res, next) => {
    try {
        const id = req.params.id;

        await admin.updateOne({ _id: id }, {
            $set: {
                status: "blocked"
            }
        })
        res.redirect('/admin/adminManagement')
    } catch (error) {
        return next(error)
    }
}
//admin unblock
const adminunBlock = async (req, res, next) => {
    try {
        const id = req.params.id;

        await admin.updateOne({ _id: id }, {
            $set: {
                status: "active"
            }
        })
        res.redirect('/admin/adminManagement')
    } catch (error) {
        return next(error)
    }
}

module.exports = {
    adminManagement,
    addAdmin,
    editAdmin,
    adminBlock,
    adminunBlock
}