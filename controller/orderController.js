const orders = require('../model/orders')
const Users = require('../model/userdata')
const address = require('../model/address')
const cart_Collection = require('../model/cart')
const products = require('../model/product')
const wallet = require('../model/wallet');
const coupon = require('../model/coupon')


//order details
const orderDetails = async (req, res) => {
    const color = req.query.color
    const size = req.query.size
    const product = await products.findOne({ _id: req.query.productid })
    const order = await orders.findOne({ _id: req.query.orderid }).populate('Billing_address Shipping_address');
    const productEntry = order.Products.find(entry => entry.Product_id.equals(req.query.productid));


    const quantity = productEntry ? productEntry.Quantity : 0;

    res.render('./user/orderDetails', { order, product, quantity, size: size, color: color });
};


// order confirmed
const order_confirmed = async (req, res) => {
    req.session.afterorder = true;
    function generateRandomBillNumber() {
        const length = 8;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let billNumber = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            billNumber += characters.charAt(randomIndex);
        }

        return billNumber;
    }

    const billingid = req.query.billingid;
    const addressid = req.query.id;
    const type = req.query.type;
    const total = req.query.total;
    const couponcode = req.query.couponcode.trim("") || null;
    let paymentStatus;
    const addressIN = await address.findOne({ _id: addressid })
    if (type == 'razorPay' || type == 'wallet') {
        paymentStatus = 'paid';
    } else {
        paymentStatus = 'pending'
    }

    const user = await Users.findOne({ Email: req.session.user })

    if (billingid && addressid) {
        try {
            const userCart = await cart_Collection.findOne({ User_id: user._id }).populate('Items.Product_id');

            const order = new orders({
                Billing_address: billingid,
                User_id: user._id,
                Products: userCart.Items.map(item => ({
                    Product_id: item.Product_id._id,
                    Quantity: item.Quantity,
                    color: item.color,
                    size: item.size
                })),
                Order_status: 'ordered',
                Total_amount: total,
                Shipping_address: addressid,
                Order_date: new Date(),
                Payment_status: paymentStatus,
                Payment_method: type,
                Bill_number: generateRandomBillNumber(),
                Delivery_date: new Date(),
                Activity: [{
                    Date: new Date(),
                    Status: 'order placed successfully',
                }],
                Coupon: couponcode
            });


            await order.save();
            for (const item of userCart.Items) {
                await products.updateOne(
                    { _id: item.Product_id._id, "variant.size": item.size, "variant.quantity": { $gte: item.Quantity } },
                    { $inc: { "variant.$.quantity": -item.Quantity } }
                );
            }
            await cart_Collection.updateOne({ User_id: user._id }, { $set: { Items: [], Total_quantity: 0 } })

            res.render('./user/order-confirmed', { orderId: order._id, total: total, addressIN: addressIN });
        } catch (error) {

            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    } else {

        res.status(400).send('Bad Request: billingid and addressid are required');
    }

};
// buy now order confirmed
const buynowOrder_confirmed = async (req, res) => {

    const total = req.session.product_total;
    const billingid = req.query.billingid;
    const addressid = req.query.id;
    const user = await Users.findOne({ Email: req.session.user })

    if (billingid && addressid) {
        try {
            const item = await products.findOne({ _id: req.session.buyNowProductid })
            const order = new orders({
                Billing_address: billingid,
                User_id: user._id,
                Products: [{
                    Product_id: item._id,
                    Quantity: 1,
                    color: req.session.product_color,
                    size: req.session.product_size
                }]
                ,
                Order_status: 'ordered',
                Total_amount: req.session.product_total,
                Shipping_address: addressid,
                Order_date: new Date(),
                Payment_status: 'pending',
                Payment_method: 'COD',
                Bill_number: 'abcd',


                Delivery_date: new Date(),
                Activity: [{
                    Date: new Date(),
                    Status: 'done',
                }],
                Coupon: billingid
            });

            await products.updateOne(
                { _id: item._id, "variant.size": req.session.product_size, "variant.quantity": { $gte: 1 } },
                { $inc: { "variant.$.quantity": -1 } }
            );
            await order.save();


            res.render('./user/buynowOrderConfirmed', { orderId: order._id, total: total });
        } catch (error) {

            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    } else {

        res.status(400).send('Bad Request: billingid and addressid are required');
    }

};

//order page user
const order = async (req, res) => {

    try {
        const coupons = await coupon.find();
        const user = await Users.findOne({ Email: req.session.user });
        const ordersDisplay = await orders.find({ User_id: user._id }).populate('Products.Product_id');

        res.render('./user/orders', { orders: ordersDisplay, coupons: coupons });
    } catch (error) {
        console.error('Order Display Error:', error);
        res.status(500).json({ error: 'Error displaying orders' });
    }

};

//cancell order
const cancelOrder = async (req, res) => {
    try {
        const id = req.params.id.trim();
        await orders.updateOne({ _id: id }, { $set: { Order_status: 'cancelled' } });
        res.redirect('/order');
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
};
//return order
const returnOrder = async (req, res) => {
    try {
        const user = await Users.findOne({ Email: req.session.user })
        const userId = user._id
        const id = req.params.id.trim();
        await orders.updateOne({ _id: id }, { $set: { Order_status: 'returned' } });
        const order = await orders.findOne({ _id: id })
        const amount = order.Total_amount;

        await wallet.updateOne(
            { User_id: userId },
            {
                $inc: { Account_balance: +amount },
                $push: {
                    Transactions: {
                        Amount: amount,
                        Date: new Date(),
                        Description: 'returned a product',
                        Transaction_type: 'debit'
                    }
                }
            }
        );
        res.redirect('/order');
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
};

//after order back page controller
const backpageManager = (req, res) => {
    req.session.afterorder = false;
    res.json({ success: true, message: 'OrderConfirmed reset to false' });
}

module.exports = {
    order,
    orderDetails,
    order_confirmed,
    buynowOrder_confirmed,
    cancelOrder,
    returnOrder,
    backpageManager
}