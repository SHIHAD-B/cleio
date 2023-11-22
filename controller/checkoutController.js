
const cart_Collection = require('../model/cart')
const Users = require('../model/userdata')
const Address = require('../model/address')
const { v4: uuidv4 } = require('uuid');
const products = require('../model/product')
const wallet = require('../model/wallet')
const Razorpay = require('razorpay')
const coupon = require('../model/coupon')



var instance = new Razorpay({
    key_id: process.env.rzp_key_id,
    key_secret: process.env.rzp_key_secret,
});

//checkout
const checkout = async (req, res) => {
    try {
        const coupons = await coupon.find();
        const billingid = req.query.billingid;
        const address = req.query.id;

        const selected_address = await Address.findOne({ _id: address })
        const from_user = await Users.findOne({ Email: req.session.user })

        let addId;
        if (selected_address && selected_address._id) {
            addId = selected_address._id;
        } else {
            addId = null;
        }
        if (!from_user) {
            return res.status(404).send('User not found');
        }
        let billAddress;
        if (billingid !== undefined && billingid !== null) {
            billAddress = await Address.findOne({ _id: billingid })
        }

        const cartItems = await cart_Collection.findOne({ User_id: from_user._id }).populate("Items.Product_id", {
            Name: 1,
            "Image.Main": 1,
            Price: 1
        });
        if (!cartItems || cartItems.Items.length === 0) {
            return res.redirect('/cart');
        }
        let totalCost = 0;

        cartItems.Items.forEach(item => {
            const price = item.Product_id.Price;
            const quantity = item.Quantity;
            totalCost += price * quantity;
        });
        req.session.cart_total = totalCost

        res.render('./user/check-out', { products: cartItems.Items, address: selected_address, user: from_user, billingid: billingid, addId: addId, total: totalCost, billAddress: billAddress, coupons: coupons });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}



//delivery
const delivery = async (req, res) => {
    try {
        const coupons = await coupon.find();
        const billingid = req.query.billingid;
        const addressid = req.query.id;



        const user = await Users.findOne({ Email: req.session.user });
        const cartItems = await cart_Collection.findOne({ User_id: user._id }).populate("Items.Product_id", {
            Name: 1,
            "Image.Main": 1,
            Price: 1
        });
        let totalCost = 0;

        cartItems.Items.forEach(item => {
            const price = item.Product_id.Price;
            const quantity = item.Quantity;
            totalCost += price * quantity;
        });

        res.render('./user/delivery', { total: totalCost, products: cartItems.Items, billingid: billingid, addressid: addressid, coupons: coupons });
    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


//buynow delivery
const buynowdelivery = async (req, res) => {

    try {
        const coupons = await coupon.find();
        const billingid = req.query.billingid;
        const addressid = req.query.id;
        const productid = req.query.pdid;
        const user = await Users.findOne({ Email: req.session.user });
        const Item = await products.findOne({ _id: req.session.buyNowProductid })





        res.render('./user/buynowDelivery', { products: Item, billingid: billingid, addressid: addressid, pdid: productid, coupons: coupons });
    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


//payment
const payment = async (req, res) => {
    try {
        const coupons = await coupon.find();
        const billingid = req.query.billingid;
        const addressid = req.query.id;
        const user = await Users.findOne({ Email: req.session.user });
        const walletBalance = await wallet.findOne({ User_id: user._id })
        const formattedWalletBalance = walletBalance ? walletBalance.Account_balance : 0;
        const cartItems = await cart_Collection.findOne({ User_id: user._id }).populate("Items.Product_id", {
            Name: 1,
            "Image.Main": 1,
            Price: 1
        });
        let totalCost = 0;

        cartItems.Items.forEach(item => {
            const price = item.Product_id.Price;
            const quantity = item.Quantity;
            totalCost += price * quantity;
        });

        req.session.cart_total_amount = totalCost;

        res.render('./user/Payment', { total: totalCost, user: user, products: cartItems.Items, billingid: billingid, addressid: addressid, walletBalance: formattedWalletBalance, coupons: coupons });
    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


//buynow payment
const buynowPayment = async (req, res) => {
    try {
        const coupons = await coupon.find();
        const billingid = req.query.billingid;
        const addressid = req.query.id;
        const user = await Users.findOne({ Email: req.session.user });
        const Item = await products.findOne({ _id: req.session.buyNowProductid })

        req.session.product_total = Item.Price


        res.render('./user/buynowPayment', { products: Item, billingid: billingid, addressid: addressid, coupons: coupons });
    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

//cart razorpay
const cart_razorpay = async (req, res, razorpayInstance) => {
    try {
        const amount = req.body.amount;
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: uuidv4(),
            payment_capture: 1,
        };


        instance.orders.create(options, (error, order) => {
            if (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Error creating Razorpay order' });
            } else {
                res.json(order);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// buy checkout
const buynowCheckout = async (req, res) => {
    try {
        const coupons = await coupon.find();
        const billingid = req.query.billingid;
        const address = req.query.id;
        const productid = req.query.pdid;
        if (req.query.size && req.query.color) {
            req.session.product_color = req.query.color;
            req.session.product_size = req.query.size;

        }
        const selected_address = await Address.findOne({ _id: address })
        const from_user = await Users.findOne({ Email: req.session.user })

        let addId;
        if (selected_address && selected_address._id) {
            addId = selected_address._id;
        } else {
            addId = null;
        }
        if (!from_user) {
            return res.status(404).send('User not found');
        }
        let billAddress;
        if (billingid !== undefined && billingid !== null) {
            billAddress = await Address.findOne({ _id: billingid })
        }

        const Item = await products.findOne({ _id: productid })




        res.render('./user/buynowCheckout', { product: Item, address: selected_address, user: from_user, billingid: billingid, addId: addId, billAddress: billAddress, coupons: coupons });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}
module.exports = {
    checkout,
    delivery,
    payment,
    buynowCheckout,
    buynowdelivery,
    buynowPayment,
    cart_razorpay
}