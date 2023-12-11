const coupon = require('../model/coupon')
const orders = require('../model/orders')

const mongoose = require('mongoose');
//clean up 
const cron = require('node-cron');

const productoffers = require('../model/productoffer')
const categoryoffers = require('../model/categoryoffer')

cron.schedule('0 */5 * * *', async () => {

    try {

        const currentDate = new Date();

        //changing status expired coupons
        await coupon.updateMany(
            {
                Expiration_date: { $lt: currentDate },
                Is_active: true,
            },
            { $set: { Is_active: false } }
        );
        //changing status of expired product offers

        await productoffers.updateMany(
            {
                Expires_at: { $lt: currentDate },
                Status: 'active',
            },
            { $set: { Status: 'expired' } }
        );

        //changing status of expired category offers
        await categoryoffers.updateMany(
            {
                Ends_at: { $lt: currentDate },
                Status: 'active',
            },
            { $set: { Status: 'expired' } }
        );

    } catch (error) {
        console.error('Error updating coupons:', error);
    }
});




//coupon page
const couponPage = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        const authority = req.session.readonly;
        const coupons = await coupon.find()

        res.render('./admin/couponManagement', { coupons: coupons, superadmin: superadmin, authority: authority })

    } catch (error) {
        console.log(error);
        return next(error)
    }
}

//add coupon
const addcoupon = async (req, res, next) => {
    try {
        const coupons = new coupon({
            Code: req.body.Code,
            Min_purchase_amount: req.body.Min_purchase_amount,
            Max_discount_value: req.body.Max_purchase_amount,
            Expiration_date: req.body.Expiration_date,
            Start_date: req.body.Start_date,
            Is_active: true,
            created: new Date(),
            Max_usage_count: req.body.Max_usage_count,
            Discount_value: req.body.Discount_value,
        });
        await coupons.save()
        res.redirect('/admin/couponManagement')
    } catch (error) {
        console.log(error);
        return next(error)
    }
}

//validate coupon
const validateCoupon = async (req, res, next) => {
    try {
        const code = req.body.couponCode.toString().trim("");
        const currentDate = new Date();

        const couponcheckArray = await coupon.find({ Code: code });
        const couponcheck = couponcheckArray[0];

        if (couponcheck) {

            if (!couponcheck.Is_active) {
                res.status(400).json({ success: false, message: "Coupon is not active" });
                return;
            }


            if (
                (couponcheck.Start_date && currentDate < couponcheck.Start_date) ||
                (couponcheck.Expiration_date && currentDate > couponcheck.Expiration_date)
            ) {
                res.status(400).json({ success: false, message: "Coupon is not valid at this time" });
                return;
            }


            const usage = await orders.find({ Coupon: code }).countDocuments();
            const limit = couponcheck.Max_usage_count;

            if (usage > limit) {
                res.status(400).json({ success: false, message: "Coupon usage limit exceeded" });
            } else {
                res.json({
                    success: true,
                    discountValue: couponcheck.Discount_value,
                    min: couponcheck.Min_purchase_amount,
                    max: couponcheck.Max_discount_value
                });
            }
        } else {
            res.status(400).json({ success: false, message: "Invalid coupon code" });
        }
    } catch (error) {
        console.error(error);
        return next(error)
    }
};

//delete coupon
const deletecoupon = async (req, res, next) => {
    try {
        await coupon.deleteOne({ _id: req.params.id })
        res.redirect('/admin/couponManagement')
    } catch (error) {
        console.log(error);
        return next(error)
    }
}

//edit coupon
const editcoupon = async (req, res, next) => {
    try {

        await coupon.updateOne({ _id: req.params.id }, {
            $set: {
                Code: req.body.Code.trim(""),
                Min_purchase_amount: req.body.Min_purchase_amount,
                Max_discount_value: req.body.Max_purchase_amount,
                Expiration_date: req.body.Expiration_date,
                Start_date: req.body.Start_date,
                Is_active: true,
                Max_usage_count: req.body.Max_usage_count,
                Discount_value: req.body.Discount_value
            }
        })
        res.redirect('/admin/couponManagement')

    } catch (error) {
        console.log(error);
        return next(error)
    }
}
module.exports = {
    couponPage,
    addcoupon,
    validateCoupon,
    deletecoupon,
    editcoupon

}