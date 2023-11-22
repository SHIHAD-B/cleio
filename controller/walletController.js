
const users = require('../model/userdata');
const wallet = require('../model/wallet');
const Razorpay = require('razorpay')
const { v4: uuidv4 } = require('uuid');
const coupon = require('../model/coupon')

var instance = new Razorpay({
    key_id: process.env.rzp_key_id,
    key_secret: process.env.rzp_key_secret,
});

//wallet page
const walletPage = async (req, res) => {
    try {
        const coupons = await coupon.find();
        const user = await users.findOne({ Email: req.session.user });
        if (user) {
            console.log(user._id);
            const wallets = await wallet.findOne({ User_id: user._id })
            console.log(wallets);
            if (wallets) {
                res.render('./user/wallet', { wallet: wallets, coupons: coupons })

            } else {
                res.render('./user/wallet', { wallet: false, coupons: coupons })
            }
        } else {
            res.redirect('/')
        }


    } catch (error) {
        console.log(error);
    }
}

//add money to wallet
const addMoneyToWallet = async (req, res) => {

    try {
        const user = await users.findOne({ Email: req.session.user });
        if (user) {
            const existingWallet = await wallet.findOne({ User_id: user._id });
            if (existingWallet) {

                await wallet.updateOne(
                    { User_id: user._id },
                    {
                        $set: { Account_balance: existingWallet.Account_balance + req.body.amount },
                        $push: {
                            Transactions: {
                                Amount: req.body.amount,
                                Date: new Date(),
                                Description: 'added to wallet',
                                Transaction_type: 'credit'
                            }
                        }
                    }
                );
            } else {

                const newWallet = new wallet({
                    User_id: user._id,
                    Account_balance: req.body.amount,
                    Transactions: [{
                        Amount: req.body.amount,
                        Date: new Date(),
                        Description: 'added to wallet',
                        Transaction_type: 'credit'
                    }]
                });
                await newWallet.save();
            }
            res.send('Money added successfully');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

//add money razor pay
const wallet_razorpay = async (req, res, razorpayInstance) => {
    try {
        const options = {
            amount: req.body.amount * 100,
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


// wallet order update
const walletOrder = async (req, res) => {
    try {
        const user = await users.findOne({ Email: req.session.user });
        const userId = user._id
        const amount = req.body.amount

        const userWallet = await wallet.findOne({ User_id: userId });

        if (!userWallet || userWallet.Account_balance < amount) {
            return res.status(400).json({ success: false, message: 'Not enough balance' });
        }

        await wallet.updateOne(
            { User_id: userId },
            {
                $inc: { Account_balance: -amount },
                $push: {
                    Transactions: {
                        Amount: amount,
                        Date: new Date(),
                        Description: 'purchased a product',
                        Transaction_type: 'debit'
                    }
                }
            }
        );

        res.json({ success: true, message: 'Wallet updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    walletPage,
    addMoneyToWallet,
    wallet_razorpay,
    walletOrder
}