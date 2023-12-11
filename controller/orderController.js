const orders = require('../model/orders')
const Users = require('../model/userdata')
const address = require('../model/address')
const cart_Collection = require('../model/cart')
const products = require('../model/product')
const wallet = require('../model/wallet');
const coupon = require('../model/coupon')

function generateTransactionID() {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000000);
    const transactionID = `${timestamp}-${randomNum}`;
    return transactionID;
}

//order details
const orderDetails = async (req, res, next) => {
    try {
        const color = req.query.color
        const size = req.query.size
        const product = await products.findOne({ _id: req.query.productid })
        const order = await orders.findOne({ _id: req.query.orderid });
        const productEntry = order.Products.find(entry => entry.Product_id.equals(req.query.productid));


        const quantity = productEntry ? productEntry.Quantity : 0;
        const price = productEntry.price

        res.render('./user/orderDetails', { price, order, product, quantity, size: size, color: color });
    } catch (error) {
        console.log(error);
        return next(error)
    }

};


// order confirmed
const order_confirmed = async (req, res, next) => {
    try {
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
        const deliveryAmount = req.query.deliveryAmount;
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
        const billingAddress = await address.findOne({ _id: billingid })
        const Address = await address.findOne({ _id: addressid })

        if (billingid && addressid) {
            try {
                const userCart = await cart_Collection.findOne({ User_id: user._id }).populate('Items.Product_id');

                const order = new orders({
                    Billing_address: {
                        address: billingAddress.address,
                        alternative_phone: billingAddress.alternative_phone,
                        city: billingAddress.city,
                        delivery_on: billingAddress.delivery_on,
                        landmark: billingAddress.landmark,
                        locality: billingAddress.locality,
                        name: billingAddress.name,
                        phone_number: billingAddress.phone_number,
                        pincode: billingAddress.phone_number,
                        state: billingAddress.state,
                        type: billingAddress.type,
                        User: billingAddress.User,
                    },
                    User_id: user._id,
                    Products: userCart.Items.map(item => ({
                        Product_id: item.Product_id._id,
                        price: item.Product_id.Price,
                        Quantity: item.Quantity,
                        color: item.color,
                        size: item.size
                    })),
                    Order_status: 'ordered',
                    Total_amount: total,
                    Shipping_address: {
                        address: Address.address,
                        alternative_phone: Address.alternative_phone,
                        city: Address.city,
                        delivery_on: Address.delivery_on,
                        landmark: Address.landmark,
                        locality: Address.locality,
                        name: Address.name,
                        phone_number: Address.phone_number,
                        pincode: Address.phone_number,
                        state: Address.state,
                        type: Address.type,
                        User: Address.User,
                    },
                    Order_date: new Date(),
                    Payment_status: paymentStatus,
                    Payment_method: type,
                    Bill_number: generateRandomBillNumber(),
                    Delivery_date: new Date(),
                    Activity: [{
                        Date: new Date(),
                        Status: 'order placed successfully',
                    }],
                    Coupon: couponcode,
                    delivery_amount: deliveryAmount
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
                return next(error)
            }
        } else {

            res.status(400).send('Bad Request: billingid and addressid are required');
        }

    } catch (error) {
        console.log(error);
        return next(error)

    }

};
// buy now order confirmed
const buynowOrder_confirmed = async (req, res, next) => {
    try {
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
        const deliveryAmount = req.query.deliveryAmount;
        const total = req.query.total;
        const billingid = req.query.billingid;
        const addressid = req.query.id;
        const type = req.query.type;
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
            const billingAddress = await address.findOne({ _id: billingid })
            const Address = await address.findOne({ _id: addressid })
            try {
                const item = await products.findOne({ _id: req.session.buyNowProductid })
                const order = new orders({
                    Billing_address: {
                        address: billingAddress.address,
                        alternative_phone: billingAddress.alternative_phone,
                        city: billingAddress.city,
                        delivery_on: billingAddress.delivery_on,
                        landmark: billingAddress.landmark,
                        locality: billingAddress.locality,
                        name: billingAddress.name,
                        phone_number: billingAddress.phone_number,
                        pincode: billingAddress.phone_number,
                        state: billingAddress.state,
                        type: billingAddress.type,
                        User: billingAddress.User,
                    },
                    User_id: user._id,
                    Products: [{
                        Product_id: item._id,
                        price: item.Price,
                        Quantity: 1,
                        color: req.session.product_color,
                        size: req.session.product_size
                    }]
                    ,
                    Order_status: 'ordered',
                    Total_amount: total,
                    Shipping_address: {
                        address: Address.address,
                        alternative_phone: Address.alternative_phone,
                        city: Address.city,
                        delivery_on: Address.delivery_on,
                        landmark: Address.landmark,
                        locality: Address.locality,
                        name: Address.name,
                        phone_number: Address.phone_number,
                        pincode: Address.phone_number,
                        state: Address.state,
                        type: Address.type,
                        User: Address.User,
                    },
                    Order_date: new Date(),
                    Payment_status: paymentStatus,
                    Payment_method: type,
                    Bill_number: generateRandomBillNumber(),


                    Delivery_date: new Date(),
                    Activity: [{
                        Date: new Date(),
                        Status: 'done',
                    }],
                    Coupon: couponcode,
                    delivery_amount: deliveryAmount
                });

                await products.updateOne(
                    { _id: item._id, "variant.size": req.session.product_size, "variant.quantity": { $gte: 1 } },
                    { $inc: { "variant.$.quantity": -1 } }
                );
                await order.save();


                res.render('./user/buynowOrderConfirmed', { orderId: order._id, total: total });
            } catch (error) {

                console.error(error);
                return next(error)
            }
        } else {

            return next(error)
        }
    } catch (error) {
        console.log(error);
        return next(error)
    }


};

//order page user
const order = async (req, res, next) => {

    try {
        const coupons = await coupon.find();
        const user = await Users.findOne({ Email: req.session.user });
        const ordersDisplay = await orders.find({ User_id: user._id }).populate('Products.Product_id');

        res.render('./user/orders', { orders: ordersDisplay, coupons: coupons });
    } catch (error) {
        console.error('Order Display Error:', error);
        return next(error)
    }

};

//cancell order
const cancelOrder = async (req, res, next) => {
    try {
        const user = await Users.findOne({ Email: req.session.user })
        const userId = user._id
        const id = req.params.id.trim();
        await orders.updateOne({ _id: id }, { $set: { Order_status: 'cancelled' } });
        const order = await orders.findOne({ _id: id })
        const amount = order.Total_amount;

        if (order.Payment_method == 'razorPay' || order.Payment_method == 'wallet' && order.Payment_status == 'paid') {
            await wallet.updateOne(
                { User_id: userId },
                {
                    $inc: { Account_balance: +amount },
                    $push: {
                        Transactions: {
                            Amount: amount,
                            Date: new Date(),
                            Description: 'cancelled a product',
                            Transaction_id: generateTransactionID(),
                            Transaction_type: 'credit'
                        }
                    }
                }
            );
        }
        res.redirect('/order');
    } catch (error) {
        console.log(error);
        return next(error)
    }
};
//return order
const returnOrder = async (req, res, next) => {
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
                        Transaction_id: generateTransactionID(),
                        Transaction_type: 'debit'
                    }
                }
            }
        );
        res.redirect('/order');
    } catch (error) {
        console.log(error);
        return next(error)
    }
};

//after order back page controller
const backpageManager = (req, res, next) => {
    try {
        req.session.afterorder = false;
        res.json({ success: true, message: 'OrderConfirmed reset to false' });

    } catch (error) {
        console.log(error);
        return next(error)
    }

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