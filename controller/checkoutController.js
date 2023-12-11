
const cart_Collection = require('../model/cart')
const Users = require('../model/userdata')
const Address = require('../model/address')
const { v4: uuidv4 } = require('uuid');
const products = require('../model/product')
const wallet = require('../model/wallet')
const Razorpay = require('razorpay')
const coupon = require('../model/coupon')
const productoffers = require('../model/productoffer')
const categoryoffers = require('../model/categoryoffer')

var instance = new Razorpay({
    key_id: process.env.rzp_key_id,
    key_secret: process.env.rzp_key_secret,
});

//checkout
const checkout = async (req, res, next) => {
    try {
        const coupons = await coupon.find();
        const billingid = req.query.billingid;
        const address = req.query.id;
        const currentDate = new Date();
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

        const cartItems = await cart_Collection.findOne({ User_id: from_user._id }).populate("Items.Product_id");
        for (const item of cartItems.Items) {
            const productDetails = await products.findById(item.Product_id._id)
                .populate({
                    path: 'product_offer',
                    select: 'Offer Starts_at Expires_at',
                    match: { Starts_at: { $lte: currentDate }, Expires_at: { $gte: currentDate } }
                })
                .populate({
                    path: 'category_offer',
                    select: 'Offer Starts_at Ends_at',
                    match: { Starts_at: { $lte: currentDate }, Ends_at: { $gte: currentDate } }
                });

            item.Product_id.product_offer = productDetails.product_offer;
            item.Product_id.category_offer = productDetails.category_offer;
        }
        // res.json(cartItems)
        if (!cartItems || cartItems.Items.length === 0) {
            return res.redirect('/cart');
        }
        let totalCost = 0;

        for (const item of cartItems.Items) {
            let price;

            if (item.Product_id.product_offer) {
                const disamount = await productoffers.findOne({ _id: item.Product_id.product_offer });
                price = item.Product_id.Price - (item.Product_id.Price * disamount.Offer / 100);
            } else if (item.Product_id.category_offer) {
                const disamount = await categoryoffers.findOne({ _id: item.Product_id.category_offer });
                price = item.Product_id.Price - (item.Product_id.Price * disamount.Offer / 100);
            } else {
                price = item.Product_id.Price;
            }

            const quantity = item.Quantity;
            totalCost += price * quantity;
        }

        req.session.cart_total = totalCost;


        res.render('./user/check-out', { products: cartItems.Items, address: selected_address, user: from_user, billingid: billingid, addId: addId, total: totalCost, billAddress: billAddress, coupons: coupons });
    } catch (error) {
        console.error('Error:', error);
        return next(error)
    }
}



//delivery
const delivery = async (req, res, next) => {
    try {
        const coupons = await coupon.find();
        const billingid = req.query.billingid;
        const addressid = req.query.id;
        const currentDate = new Date();


        const user = await Users.findOne({ Email: req.session.user });
        const cartItems = await cart_Collection.findOne({ User_id: user._id }).populate("Items.Product_id");
        for (const item of cartItems.Items) {
            const productDetails = await products.findById(item.Product_id._id)
                .populate({
                    path: 'product_offer',
                    select: 'Offer Starts_at Expires_at',
                    match: { Starts_at: { $lte: currentDate }, Expires_at: { $gte: currentDate } }
                })
                .populate({
                    path: 'category_offer',
                    select: 'Offer Starts_at Ends_at',
                    match: { Starts_at: { $lte: currentDate }, Ends_at: { $gte: currentDate } }
                });

            item.Product_id.product_offer = productDetails.product_offer;
            item.Product_id.category_offer = productDetails.category_offer;
        }
        let totalCost = 0;

        for (const item of cartItems.Items) {
            let price;

            if (item.Product_id.product_offer) {
                const offer = await productoffers.findOne({
                    _id: item.Product_id.product_offer,
                    start_date: { $lte: new Date() },
                    expire_date: { $gte: new Date() }
                });

                if (offer) {
                    // Offer is valid; apply the discount
                    price = item.Product_id.Price - (item.Product_id.Price * offer.Offer / 100);
                } else {
                    // Offer is not valid; use regular price
                    price = item.Product_id.Price;
                }
            } else if (item.Product_id.category_offer) {
                const offer = await categoryoffers.findOne({
                    _id: item.Product_id.category_offer,
                    start_date: { $lte: new Date() },
                    expire_date: { $gte: new Date() }
                });

                if (offer) {
                    // Offer is valid; apply the discount
                    price = item.Product_id.Price - (item.Product_id.Price * offer.Offer / 100);
                } else {
                    // Offer is not valid; use regular price
                    price = item.Product_id.Price;
                }
            } else {
                // No offer; use regular price
                price = item.Product_id.Price;
            }

            const quantity = item.Quantity;
            totalCost += price * quantity;
        }



        res.render('./user/delivery', { total: totalCost, products: cartItems.Items, billingid: billingid, addressid: addressid, coupons: coupons });
    } catch (error) {

        console.error(error);
        return next(error)
    }
};


//buynow delivery
const buynowdelivery = async (req, res, next) => {

    try {
        const currentDate = new Date();
        const coupons = await coupon.find();
        const billingid = req.query.billingid;
        const addressid = req.query.id;
        const productid = req.query.pdid;
        const user = await Users.findOne({ Email: req.session.user });
        const Item = await products.findOne({ _id: req.session.buyNowProductid })
            .populate({
                path: "product_offer",
                match: { Starts_at: { $lte: currentDate }, Expires_at: { $gte: currentDate } }
            })
            .populate({
                path: "category_offer",
                match: { Starts_at: { $lte: currentDate }, Ends_at: { $gte: currentDate } }
            })




        res.render('./user/buynowDelivery', { products: Item, billingid: billingid, addressid: addressid, pdid: productid, coupons: coupons });
    } catch (error) {

        console.error(error);
        return next(error)
    }
};


//payment
const payment = async (req, res, next) => {
    try {
        const coupons = await coupon.find();
        const billingid = req.query.billingid;
        const addressid = req.query.id;
        const deliveryAmount = req.query.deliveryAmount;
        const currentDate = new Date();
        const user = await Users.findOne({ Email: req.session.user });
        const walletBalance = await wallet.findOne({ User_id: user._id })
        const formattedWalletBalance = walletBalance ? walletBalance.Account_balance : 0;
        const cartItems = await cart_Collection.findOne({ User_id: user._id }).populate("Items.Product_id");
        for (const item of cartItems.Items) {
            const productDetails = await products.findById(item.Product_id._id)
                .populate({
                    path: 'product_offer',
                    select: 'Offer Starts_at Expires_at',
                    match: { Starts_at: { $lte: currentDate }, Expires_at: { $gte: currentDate } }
                })
                .populate({
                    path: 'category_offer',
                    select: 'Offer Starts_at Ends_at',
                    match: { Starts_at: { $lte: currentDate }, Ends_at: { $gte: currentDate } }
                });

            item.Product_id.product_offer = productDetails.product_offer;
            item.Product_id.category_offer = productDetails.category_offer;
        }
        let totalCost = 0;

        for (const item of cartItems.Items) {
            let price;

            if (item.Product_id.product_offer) {
                const disamount = await productoffers.findOne({ _id: item.Product_id.product_offer });
                price = item.Product_id.Price - (item.Product_id.Price * disamount.Offer / 100);
            } else if (item.Product_id.category_offer) {
                const disamount = await categoryoffers.findOne({ _id: item.Product_id.category_offer });
                price = item.Product_id.Price - (item.Product_id.Price * disamount.Offer / 100);
            } else {
                price = item.Product_id.Price;
            }

            const quantity = item.Quantity;
            totalCost += price * quantity;
        }
        totalCost += Number(deliveryAmount);
        req.session.cart_total_amount = totalCost;

        res.render('./user/payment', { total: totalCost, user: user, products: cartItems.Items, billingid: billingid, addressid: addressid, walletBalance: formattedWalletBalance, coupons: coupons, deliveryAmount: deliveryAmount });
    } catch (error) {

        console.error(error);
        return next(error)
    }
}


//buynow payment
const buynowPayment = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const coupons = await coupon.find();
        const billingid = req.query.billingid;
        const addressid = req.query.id;
        const deliveryAmount = req.query.deliveryAmount;
        const user = await Users.findOne({ Email: req.session.user });
        const walletBalance = await wallet.findOne({ User_id: user._id })
        const formattedWalletBalance = walletBalance ? walletBalance.Account_balance : 0;
        const Item = await products.findOne({ _id: req.session.buyNowProductid })
            .populate({
                path: "product_offer",
                match: { Starts_at: { $lte: currentDate }, Expires_at: { $gte: currentDate } }
            })
            .populate({
                path: "category_offer",
                match: { Starts_at: { $lte: currentDate }, Ends_at: { $gte: currentDate } }
            })
        let priceone = Item.Price;
        if (Item.product_offer) {
            const prdiscount = await productoffers.findOne({ _id: Item.product_offer });
            priceone = priceone - (priceone * prdiscount.Offer / 100);

        } else if (Item.category_offer) {
            const cadiscount = await categoryoffers.findOne({ _id: Item.category_offer });
            priceone = priceone - (priceone * cadiscount.Offer / 100);
        }
        req.session.product_total = Item.Price + Number(deliveryAmount)


        res.render('./user/buynowPayment', { total: priceone + Number(deliveryAmount), user: user, products: Item, billingid: billingid, addressid: addressid, coupons: coupons, walletBalance: formattedWalletBalance, deliveryAmount: deliveryAmount });
    } catch (error) {

        console.error(error);
        return next(error)
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
const buynowCheckout = async (req, res, next) => {
    try {
        const currentDate = new Date();
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
            .populate({
                path: "product_offer",
                match: { Starts_at: { $lte: currentDate }, Expires_at: { $gte: currentDate } }
            })
            .populate({
                path: "category_offer",
                match: { Starts_at: { $lte: currentDate }, Ends_at: { $gte: currentDate } }
            })




        res.render('./user/buynowCheckout', { product: Item, address: selected_address, user: from_user, billingid: billingid, addId: addId, billAddress: billAddress, coupons: coupons });
    } catch (error) {
        console.error('Error:', error);
        return next(error)
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