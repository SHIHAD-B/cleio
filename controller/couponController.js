const coupon = require('../model/coupon')
const orders = require('../model/orders')
//coupon page
const couponPage = async (req, res) => {
    try {
        const coupons = await coupon.find()

        res.render('./admin/couponManagement', { coupons: coupons })

    } catch (error) {
        console.log(error);
    }
}

//add coupon
const addcoupon = async (req, res) => {
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
    }
}

//validate coupon
const validateCoupon = async (req, res) => {
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
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


module.exports = {
    couponPage,
    addcoupon,
    validateCoupon
}