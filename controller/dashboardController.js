const Orders = require('../model/orders');
const Products = require('../model/product');
const users = require('../model/userdata');

const dashboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const monthlyStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const yearlyStart = new Date(today.getFullYear(), 0, 1);

        const totalDeliveryToday = await Orders.countDocuments({
            Order_date: { $gte: today },
            Order_status: 'delivered'
        });
        const totalOrdersToday = await Orders.countDocuments({
            Order_date: { $gte: today }
        });

        const totalreturnToday = await Orders.countDocuments({
            Order_date: { $gte: today }, Order_status: 'returned'
        });

        const totalOrdersMonthly = await Orders.countDocuments({
            Order_date: { $gte: monthlyStart }
        });

        const totalOrdersYearly = await Orders.countDocuments({
            Order_date: { $gte: yearlyStart }
        });

        const totalProducts = await Products.countDocuments();
        const totalUsers = await users.countDocuments();

        const totalPricesToday = await Orders.aggregate([
            {
                $match: { Order_date: { $gte: today }, Order_status: 'delivered' }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$Total_amount" }
                }
            }
        ]);


        const totalPricesMonthly = await Orders.aggregate([
            {
                $match: { Order_date: { $gte: monthlyStart }, Order_status: 'delivered' }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$Total_amount" }
                }
            }
        ]);

        const totalPricesYearly = await Orders.aggregate([
            {
                $match: { Order_date: { $gte: yearlyStart }, Order_status: 'delivered' }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$Total_amount" }
                }
            }
        ]);

        const totalPriceToday = totalPricesToday.length > 0 ? totalPricesToday[0].total : 0;
        const totalPriceMonthly = totalPricesMonthly.length > 0 ? totalPricesMonthly[0].total : 0;
        const totalPriceYearly = totalPricesYearly.length > 0 ? totalPricesYearly[0].total : 0;

        res.render('./admin/dashboard', {
            deliveryToday: totalDeliveryToday,
            ordersToday: totalOrdersToday,
            ordersMonthly: totalOrdersMonthly,
            ordersYearly: totalOrdersYearly,
            products: totalProducts,
            users: totalUsers,
            totalreturnToday: totalreturnToday,
            priceToday: totalPriceToday,
            priceMonthly: totalPriceMonthly,
            priceYearly: totalPriceYearly
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    dashboard
};
