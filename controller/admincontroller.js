const users = require('../model/userdata')
const admin = require('../model/admindata')
const bcrypt = require('bcrypt');
const orders = require('../model/orders')
const wallet = require('../model/wallet')

//default
const defaultAdmin = (req, res, next) => {
    try {
        if (req.session.isadmin) {

            res.redirect('/admin/dashboard')
        } else {
            res.render('./admin/adminLogin')
        }

    } catch (error) {
        console.log(error);
        return next(error)
    }
}

//login page
function addlogin(req, res, next) {
    try {
        res.render('./admin/adminLogin', { error: false })

    } catch (error) {
        console.log(error);
        return next(error)
    }
}

//post login
const postlogin = async (req, res, next) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        const adminUser = await admin.findOne({ email: email });
        if (adminUser.status == "blocked") {
            res.status(401).json({ message: "Admin blocked" })
        } else
            if (bcrypt.compareSync(password, adminUser.password)) {
                req.session.admin = email;
                req.session.isadmin = true;
                if (adminUser.role == "superadmin") {
                    req.session.superadmin = true;
                } else {

                    req.session.superadmin = false;
                }
                if (adminUser.authority == 'readonly') {
                    req.session.readonly = true
                } else {
                    req.session.readonly = false

                }
                res.json({ success: true, isAdmin: true });
            } else if (adminUser && !bcrypt.compareSync(password, adminUser.password)) {

                res.status(401).json({ message: "incorrect password" })
            }
            else {

                res.status(401).json({ message: "User not found" });
            }
    } catch (error) {
        console.log(error);
        return next(error)
    }
};

//user management
const userdetails = async (req, res) => {
    try {
        const superadmin = req.session.superadmin;
        const authority = req.session.readonly;
        const page = req.query.page || 1;
        const itemsPerPage = 10;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        const userdata = await users.find({ isdeleted: { $eq: false } });
        const data = userdata.reverse().slice(startIndex, endIndex);

        if (userdata) {

            res.render('./admin/usermangement', { userdata: userdata, data: data, currentPage: page, superadmin: superadmin, authority: authority });
        } else {
            res.render('./admin/usermangement', { userdata: userdata, data: data, currentPage: page, superadmin: superadmin, authority: authority });
        }
    } catch (error) {
        console.log(error);
    }
}


//edit user
const edituser = async (req, res) => {
    try {
        if (req.body.password) {
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            const id = req.params.id;
            await users.updateOne({ _id: id }, {
                Firstname: req.body.firstname,
                Secondname: req.body.secondname,
                Email: req.body.email,
                Password: hashedPassword,
                Status: req.body.status,
                Role: req.body.role,
                Mobile: req.body.phonenumber,
            })
                .then(() => {
                    res.redirect('/admin');
                })
                .catch((err) => {
                    console.log(err);
                })
        } else {
            const id = req.params.id;
            await users.updateOne({ _id: id }, {
                Firstname: req.body.firstname,
                Secondname: req.body.secondname,
                Email: req.body.email,
                Status: req.body.status,
                Role: req.body.role,
                Mobile: req.body.phonenumber,
            })
                .then(() => {
                    res.redirect('/admin');
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    } catch (error) {
        console.log(error);
    }

}









//userdelete
const deleteuser = async (req, res) => {
    try {
        const id = req.params.id;

        await users.updateOne({ _id: id }, { isdeleted: true })
            .then(() => {
                res.redirect('/admin/user');
            })
            .catch((err) => {
                console.log(err);
            })
    } catch (error) {
        console.log(error);
    }

}

//blockuser
const blockuser = async (req, res) => {
    try {
        const id = req.params.id;
        await users.updateOne({ _id: id }, { $set: { Status: "blocked" } })
            .then(() => {
                res.redirect('/admin')
            })
            .catch((err) => {
                console.log(err);
            })
    } catch (error) {
        console.log(error);
    }

}

//activeuser
const activeuser = async (req, res) => {
    try {
        const id = req.params.id;
        await users.updateOne({ _id: id }, { $set: { Status: "active" } })
            .then(() => {
                res.redirect('/admin')
            })
            .catch((err) => {
                console.log(err);
            })
    } catch (error) {
        console.log(error);
    }

}
//user management search
const usersearch = async (req, res) => {
    try {
        const page = 1;
        const searchQuery = req.query.query;
        const data = await users.find({
            Firstname: {
                $regex: "^" + searchQuery, $options: "i"
            }
        })

        res.render('./admin/usermangement', { userdata: data, data: data, currentPage: page })

    } catch (error) {
        console.log(error);
    }

}

//order management page 
const order = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        const order = await orders.find({})
        res.render('./admin/ordermanagement', { data: order, superadmin: superadmin })
    } catch (error) {
        console.log(error);
        return next(error)
    }


}

//order details
const order_details = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        const authority = req.session.readonly;
        const order = await orders
            .findOne({ _id: req.query.orderid })
            .populate('Products.Product_id Billing_address Shipping_address')


        res.render('./admin/orderdetails', { orders: order, orderid: order._id, superadmin: superadmin, authority: authority });
    } catch (error) {
        console.error(error);
        return next(error)
    }

};

//order status update
const orderStatus = async (req, res, next) => {
    try {

        const orderId = req.body.orderId;
        const orderStatus = req.body.orderStatus;
        const paymentStatus = req.body.paymentStatus;
        let deliveryDate;

        if (orderStatus == 'delivered') {

            deliveryDate = new Date()
        } else {

            deliveryDate = ""

        }

        const updatedOrder = await orders.findByIdAndUpdate(orderId, {
            Order_status: orderStatus,
            Payment_status: paymentStatus,
            Delivery_date: deliveryDate
        }, { new: true });


        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        return next(error)
    }
}
//admin logout
const logout = (req, res, next) => {
    try {
        req.session.isadmin = false;
        req.session.admin = false;
        res.redirect('/admin')
    } catch (error) {
        console.log(error);
        return next(error)
    }
}

//transaction page
const transactionPage = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        const authority = req.session.readonly;
        const walletdata = await wallet.find()
        res.render('./admin/transaction', { superadmin: superadmin, authority: authority, data: walletdata })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    userdetails,
    deleteuser,
    blockuser,
    activeuser,
    usersearch,
    edituser,
    order,
    order_details,
    orderStatus,
    addlogin,
    defaultAdmin,
    postlogin,
    transactionPage,
    logout
}