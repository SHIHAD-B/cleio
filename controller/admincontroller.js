const users = require('../model/userdata')
const cart_Collection = require('../model/cart');
const bcrypt = require('bcrypt');
const orders = require('../model/orders')


//userdetails
const userdetails = async (req, res) => {


    const data = await users.find({ isdeleted: { $eq: false } });
    res.render('./admin/usermangement', { data: data })

}
//edit user
const edituser = async (req, res) => {
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
}









//userdelete
const deleteuser = async (req, res) => {
    const id = req.params.id;

    await users.updateOne({ _id: id }, { isdeleted: true })
        .then(() => {
            res.redirect('/admin');
        })
        .catch((err) => {
            console.log(err);
        })
}

//blockuser
const blockuser = async (req, res) => {
    const id = req.params.id;
    await users.updateOne({ _id: id }, { $set: { Status: "blocked" } })
        .then(() => {
            res.redirect('/admin')
        })
        .catch((err) => {
            console.log(err);
        })
}

//activeuser
const activeuser = async (req, res) => {
    const id = req.params.id;
    await users.updateOne({ _id: id }, { $set: { Status: "active" } })
        .then(() => {
            res.redirect('/admin')
        })
        .catch((err) => {
            console.log(err);
        })
}
//user management search
const usersearch = async (req, res) => {
    const searchQuery = req.query.query;
    const data = await users.find({
        Firstname: {
            $regex: "^" + searchQuery, $options: "i"
        }
    })

    res.render('./admin/usermangement', { data: data })

}

//order management page 
const order = async (req, res) => {
    const order = await orders.find({})
    res.render('./admin/ordermanagement', { data: order })

}

//order details
const order_details = async (req, res) => {

    try {
        const order = await orders
            .findOne({ _id: req.query.orderid })
            .populate('Products.Product_id Billing_address Shipping_address')


        res.render('./admin/orderdetails', { orders: order, orderid: order._id });
    } catch (error) {
        console.error(error);

        res.status(500).send('Internal Server Error');
    }

};

//order status update
const orderStatus = async (req, res) => {
    try {

        const orderId = req.body.orderId;
        const orderStatus = req.body.orderStatus;
        const paymentStatus = req.body.paymentStatus;


        const updatedOrder = await orders.findByIdAndUpdate(orderId, {
            Order_status: orderStatus,
            Payment_status: paymentStatus
        }, { new: true });


        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
    orderStatus
}