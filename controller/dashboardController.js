const Orders = require('../model/orders');
const Products = require('../model/product');
const users = require('../model/userdata');

const dashboard = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const revenueToday = await Orders.aggregate([
            {
                $match: {
                    Order_date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                    Order_status: 'delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$Total_amount" }
                }
            }
        ]).exec();

        const totalRevenueToday = revenueToday.length > 0 ? revenueToday[0].totalRevenue : 0;

        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 6) % 7);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const revenueThisWeek = await Orders.aggregate([
            {
                $match: {
                    Order_date: { $gte: startOfWeek, $lt: endOfWeek },
                    Order_status: 'delivered'
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$Order_date" },
                    totalRevenue: { $sum: "$Total_amount" }
                }
            }
        ]).exec();

        const totalRevenueThisWeekByDay = Array.from({ length: 7 }, (_, index) => {
            const day = (index + 1);
            const dayRevenue = revenueThisWeek.find(item => item._id === day);
            return dayRevenue ? dayRevenue.totalRevenue : 0;
        });

        const startOfYear = new Date();
        startOfYear.setHours(0, 0, 0, 0);
        startOfYear.setMonth(0, 1);

        const endOfYear = new Date(startOfYear);
        endOfYear.setFullYear(startOfYear.getFullYear() + 1);

        const revenueThisYear = await Orders.aggregate([
            {
                $match: {
                    Order_date: { $gte: startOfYear, $lt: endOfYear },
                    Order_status: 'delivered'
                }
            },
            {
                $group: {
                    _id: { $month: "$Order_date" },
                    totalRevenue: { $sum: "$Total_amount" }
                }
            }
        ]).exec();

        const totalRevenueThisYearByMonth = Array.from({ length: 12 }, (_, index) => {
            const month = (index + 1);
            const monthRevenue = revenueThisYear.find(item => item._id === month);
            return monthRevenue ? monthRevenue.totalRevenue : 0;
        });

        const currentYear = new Date().getFullYear();

        const totalRevenueByYear = [];

        for (let i = currentYear - 4; i <= currentYear; i++) {
            const startOfYear = new Date(i, 0, 1);
            const endOfYear = new Date(i + 1, 0, 1);

            const revenueThisYear = await Orders.aggregate([
                {
                    $match: {
                        Order_date: { $gte: startOfYear, $lt: endOfYear },
                        Order_status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$Total_amount" }
                    }
                }
            ]).exec();

            const totalRevenueThisYearValue = revenueThisYear.length > 0 ? revenueThisYear[0].totalRevenue : 0;

            totalRevenueByYear.push(totalRevenueThisYearValue);
        }







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
        const totalUsers = await users.find({ isdeleted: false }).countDocuments();

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






        res.render('./admin/dashboard', {
            deliveryToday: totalDeliveryToday,
            ordersToday: totalOrdersToday,
            ordersMonthly: totalOrdersMonthly,
            ordersYearly: totalOrdersYearly,
            products: totalProducts,
            users: totalUsers,
            totalreturnToday: totalreturnToday,
            totalRevenueToday: totalRevenueToday,
            totalRevenueThisWeek: totalRevenueThisWeekByDay,
            totalRevenueThisMonth: totalRevenueThisYearByMonth,
            totalRevenueThisYear: totalRevenueByYear,
            superadmin: superadmin
        });

    } catch (error) {
        console.error(error);
        return next(error)
    }
};

module.exports = {
    dashboard
};
