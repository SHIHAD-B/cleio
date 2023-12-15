const Orders = require('../model/orders');
const pdf = require('html-pdf');
const Products = require('../model/product');
const users = require('../model/userdata');
const fs = require('fs');
const dailyReport = async (data) => {
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CLEIO(sales report)</title>
                <style>
                  
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }

                    header {
                        background-color: #333;
                        color: #fff;
                        padding: 1rem;
                        text-align: center;
                    }

                    section {
                        padding: 2rem;
                    }

                    h2 {
                        color: #333;
                    }

                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }

                    .report-table th, .report-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }

                    footer {
                        background-color: #333;
                        color: #fff;
                        padding: 1rem;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <header>
                    <h1>CLEIO(sales report)</h1>
                </header>
                <section>
                    <h2>Summary</h2>
                    <p>Delivery today: ${data.delivery}</p>
                    <p>Orders today: ${data.orders}</p>
                    <p>Total Returns today: ${data.return}</p>
                    <h2>Financial Overview</h2>
                    <table class="report-table">
                    <thead>
                        <tr>
                            <th>Time Period</th>
                          
                            <th>Sales</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Today</td>
                            <td>${data.orders}</td>
                            <td>${data.price}</td>
                           
                        </tr>
                    </tbody>
                </table>
                
                    <h2>Inventory and Users</h2>
                    <p>Total Products: ${data.products}</p>
                    <p>Total Users: ${data.users}</p>
                </section>
                <footer>
                    <!-- Add any footer content or information here -->
                </footer>
            </body>
            </html>
        `;

        return htmlContent;
    } catch (error) {
        console.error('Error rendering overall report:', error);
        throw error;
    }
};

const weeklyReport = async (data) => {
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CLEIO(sales report)</title>
                <style>
                   
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }

                    header {
                        background-color: #333;
                        color: #fff;
                        padding: 1rem;
                        text-align: center;
                    }

                    section {
                        padding: 2rem;
                    }

                    h2 {
                        color: #333;
                    }

                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }

                    .report-table th, .report-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }

                    footer {
                        background-color: #333;
                        color: #fff;
                        padding: 1rem;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <header>
                    <h1>CLEIO(sales report)</h1>
                </header>
                <section>
                    <h2>Summary</h2>
                    <p>Delivery This Week: ${data.delivery}</p>
                    <p>Orders This Week: ${data.orders.reduce((sum, value) => sum + value, 0)}</p>
                    <p>Total Returns this week: ${data.return.reduce((sum, value) => sum + value, 0)}</p>
                    <h2>Financial Overview</h2>
                    <table class="report-table">
                    <thead>
                        <tr>
                            <th>Time Period</th>
                            <th>Returns</th>
                          
                            <th>Sales</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Sunday</td>
                            <td>${data.return[0]}</td>
                            <td>${data.orders[0]}</td>
                            <td>${data.price[0]}</td>
                           
                        </tr>
                        <tr>
                            <td>Monday</td>
                            <td>${data.return[1]}</td>
                            <td>${data.orders[1]}</td>
                            <td>${data.price[1]}</td>
                           
                        </tr>
                        <tr>
                            <td>Tuesday</td>
                            <td>${data.return[2]}</td>
                            <td>${data.orders[2]}</td>
                            <td>${data.price[2]}</td>
                           
                        </tr>
                        <tr>
                            <td>Wednesday</td>
                            <td>${data.return[3]}</td>
                            <td>${data.orders[3]}</td>
                            <td>${data.price[3]}</td>
                           
                        </tr>
                        <tr>
                            <td>Thursday</td>
                            <td>${data.return[4]}</td>
                            <td>${data.orders[4]}</td>
                            <td>${data.price[4]}</td>
                           
                        </tr>
                        <tr>
                            <td>Friday</td>
                            <td>${data.return[5]}</td>
                            <td>${data.orders[5]}</td>
                            <td>${data.price[5]}</td>
                           
                        </tr>
                        <tr>
                            <td>Saturday</td>
                            <td>${data.return[6]}</td>
                            <td>${data.orders[6]}</td>
                            <td>${data.price[6]}</td>
                           
                        </tr>
                    </tbody>
                </table>
                
                    <h2>Inventory and Users</h2>
                    <p>Total Products: ${data.products}</p>
                    <p>Total Users: ${data.users}</p>
                </section>
                <footer>
                    <!-- Add any footer content or information here -->
                </footer>
            </body>
            </html>
        `;

        return htmlContent;
    } catch (error) {
        console.error('Error rendering overall report:', error);
        throw error;
    }
};

const MonthlyReport = async (data) => {
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CLEIO(sales report)</title>
                <style>
                   
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }

                    header {
                        background-color: #333;
                        color: #fff;
                        padding: 1rem;
                        text-align: center;
                    }

                    section {
                        padding: 2rem;
                    }

                    h2 {
                        color: #333;
                    }

                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }

                    .report-table th, .report-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }

                    footer {
                        background-color: #333;
                        color: #fff;
                        padding: 1rem;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <header>
                    <h1>CLEIO(sales report)</h1>
                </header>
                <section>
                    <h2>Summary</h2>
                    <p>Delivery This year: ${data.delivery.reduce((sum, value) => sum + value, 0)}</p>
                    <p>Orders This year: ${data.orders.reduce((sum, value) => sum + value, 0)}</p>
                    <p>Total Returns this year: ${data.return.reduce((sum, value) => sum + value, 0)}</p>
                    <h2>Financial Overview</h2>
                    <table class="report-table">
                    <thead>
                        <tr>
                            <th>Time Period</th>
                            <th>Returns</th>
                          
                            <th>Sales</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>January</td>
                            <td>${data.return[0]}</td>
                            <td>${data.orders[0]}</td>
                            <td>${data.price[0]}</td>
                           
                        </tr>
                        <tr>
                            <td>Febraury</td>
                            <td>${data.return[1]}</td>
                            <td>${data.orders[1]}</td>
                            <td>${data.price[1]}</td>
                           
                        </tr>
                        <tr>
                            <td>March</td>
                            <td>${data.return[2]}</td>
                            <td>${data.orders[2]}</td>
                            <td>${data.price[2]}</td>
                           
                        </tr>
                        <tr>
                            <td>April</td>
                            <td>${data.return[3]}</td>
                            <td>${data.orders[3]}</td>
                            <td>${data.price[3]}</td>
                           
                        </tr>
                        <tr>
                            <td>May</td>
                            <td>${data.return[4]}</td>
                            <td>${data.orders[4]}</td>
                            <td>${data.price[4]}</td>
                           
                        </tr>
                        <tr>
                            <td>June</td>
                            <td>${data.return[5]}</td>
                            <td>${data.orders[5]}</td>
                            <td>${data.price[5]}</td>
                           
                        </tr>
                        <tr>
                            <td>July</td>
                            <td>${data.return[6]}</td>
                            <td>${data.orders[6]}</td>
                            <td>${data.price[6]}</td>
                           
                        </tr>
                        <tr>
                            <td>August</td>
                            <td>${data.return[7]}</td>
                            <td>${data.orders[7]}</td>
                            <td>${data.price[7]}</td>
                           
                        </tr>
                        <tr>
                            <td>September</td>
                            <td>${data.return[8]}</td>
                            <td>${data.orders[8]}</td>
                            <td>${data.price[8]}</td>
                           
                        </tr>
                        <tr>
                            <td>October</td>
                            <td>${data.return[9]}</td>
                            <td>${data.orders[9]}</td>
                            <td>${data.price[9]}</td>
                           
                        </tr>
                        <tr>
                            <td>November</td>
                            <td>${data.return[10]}</td>
                            <td>${data.orders[10]}</td>
                            <td>${data.price[10]}</td>
                           
                        </tr>
                        <tr>
                            <td>December</td>
                            <td>${data.return[11]}</td>
                            <td>${data.orders[11]}</td>
                            <td>${data.price[11]}</td>
                           
                        </tr>
                    </tbody>
                </table>
                
                    <h2>Inventory and Users</h2>
                    <p>Total Products: ${data.products}</p>
                    <p>Total Users: ${data.users}</p>
                </section>
                <footer>
                   
                </footer>
            </body>
            </html>
        `;

        return htmlContent;
    } catch (error) {
        console.error('Error rendering overall report:', error);
        throw error;
    }
};

const dateReport = async (dataByDay) => {
    try {
        if (dataByDay && dataByDay.length > 0) {
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CLEIO(sales report)</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }

                    header {
                        background-color: #333;
                        color: #fff;
                        padding: 1rem;
                        text-align: center;
                    }

                    section {
                        padding: 2rem;
                    }

                    h2 {
                        color: #333;
                    }

                    .daily-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }

                    .daily-table th, .daily-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }

                    footer {
                        background-color: #333;
                        color: #fff;
                        padding: 1rem;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
           
                <header>
                    <h1>CLEIO(sales report)</h1>
                </header>
                <section>
                <h2>Summary</h2>
                <p>Delivery : ${dataByDay[0].delivery.totalDeliveries}</p>
                <p>Orders : ${dataByDay[0].totalOrders}</p>
                <p>Total Returns : ${dataByDay[0].totalReturns}</p>
                <h2>Financial Overview</h2>
                   
                    <table class="daily-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Orders</th>
                                <th>Returns</th>
                                <th>Revenue</th>
                              
                            </tr>
                        </thead>
                        <tbody>
                            ${dataByDay.map(dayData => `
                                <tr>
                                    <td>${dayData.date}</td>
                                    <td>${dayData.totalOrders}</td>
                                    <td>${dayData.totalReturns}</td>
                                    <td>${dayData.totalRevenue}</td>
                                    <!-- Add more cells as needed -->
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <h2>Inventory and Users</h2>
                    <p>Total Products: ${dataByDay[0].products}</p>
                    <p>Total Users: ${dataByDay[0].users}</p>
                </section>
                <footer>
                    <!-- Add any footer content or information here -->
                </footer>
            </body>
            </html>
        `;

            return htmlContent;
        } else {
            // Handle the case when dataByDay is empty
            console.warn('Data is empty. Unable to generate the report.');
            return '<h1>NO DATA AVAILABLE</h1>'; // or you can return an error message
        }
    } catch (error) {
        console.error('Error rendering daily report:', error);
        throw error;
    }
};


const generateOverallReport = async (req, res, next) => {
    try {
        let htmlContent;
        let data;
        const totalProducts = await Products.countDocuments();
        const totalUsers = await users.find({ isdeleted: false }).countDocuments();

        if (req.query.type === 'daily') {
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
            const totalRevenueToday = revenueToday.length > 0 ? revenueToday[0].totalRevenue : 0;
            data = {
                type: "today",
                delivery: totalDeliveryToday,
                orders: totalOrdersToday,
                products: totalProducts,
                users: totalUsers,
                totalreturn: totalreturnToday,
                price: totalRevenueToday,

            };

            htmlContent = await dailyReport(data);
        } else if (req.query.type === 'weekly') {
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
            const ordersThisWeek = await Orders.aggregate([
                {
                    $match: {
                        Order_date: { $gte: startOfWeek, $lt: endOfWeek },
                        Order_status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$Order_date" },
                        totalOrders: { $sum: 1 }
                    }
                }
            ]).exec();

            const returnsThisWeek = await Orders.aggregate([
                {
                    $match: {
                        Order_date: { $gte: startOfWeek, $lt: endOfWeek },
                        Order_status: 'returned'
                    }
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$Order_date" },
                        totalReturns: { $sum: 1 }
                    }
                }
            ]).exec();
            const deliveredThisWeek = await Orders.aggregate([
                {
                    $match: {
                        Order_date: { $gte: startOfWeek, $lt: endOfWeek },
                        Order_status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalDelivered: { $sum: 1 }
                    }
                }
            ]).exec();

            const totalDeliveredThisWeek = deliveredThisWeek.length > 0 ? deliveredThisWeek[0].totalDelivered : 0;


            const ordersThisWeekByDay = Array.from({ length: 7 }, (_, index) => {
                const day = (index + 1);
                const dayData = ordersThisWeek.find(item => item._id === day);
                return dayData ? dayData.totalOrders : 0;
            });

            const returnsThisWeekByDay = Array.from({ length: 7 }, (_, index) => {
                const day = (index + 1);
                const dayData = returnsThisWeek.find(item => item._id === day);
                return dayData ? dayData.totalReturns : 0;
            });

            const totalRevenueThisWeekByDay = Array.from({ length: 7 }, (_, index) => {
                const day = (index + 1);
                const dayRevenue = revenueThisWeek.find(item => item._id === day);
                return dayRevenue ? dayRevenue.totalRevenue : 0;
            });
            data = {
                type: "weekly",
                delivery: totalDeliveredThisWeek,
                orders: ordersThisWeekByDay,
                products: totalProducts,
                users: totalUsers,
                return: returnsThisWeekByDay,
                price: totalRevenueThisWeekByDay,

            };
            htmlContent = await weeklyReport(data);

        } else if (req.query.type === 'monthly') {
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
            const ordersThisYear = await Orders.aggregate([
                {
                    $match: {
                        Order_date: { $gte: startOfYear, $lt: endOfYear },
                        Order_status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: { $month: "$Order_date" },
                        totalOrders: { $sum: 1 }
                    }
                }
            ]).exec();

            const returnsThisYear = await Orders.aggregate([
                {
                    $match: {
                        Order_date: { $gte: startOfYear, $lt: endOfYear },
                        Order_status: 'returned'
                    }
                },
                {
                    $group: {
                        _id: { $month: "$Return_date" },
                        totalReturns: { $sum: 1 }
                    }
                }
            ]).exec();
            const deliveriesThisYear = await Orders.aggregate([
                {
                    $match: {
                        Order_date: { $gte: startOfYear, $lt: endOfYear },
                        Order_status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: { $month: "$Order_date" },
                        totalDeliveries: { $sum: 1 }
                    }
                }
            ]).exec();
            const ordersThisYearByMonth = Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;
                const monthOrders = ordersThisYear.find(item => item._id === month);
                return monthOrders ? monthOrders.totalOrders : 0;
            });

            const returnsThisYearByMonth = Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;
                const monthReturns = returnsThisYear.find(item => item._id === month);
                return monthReturns ? monthReturns.totalReturns : 0;
            });
            const deliveriesThisYearByMonth = Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;
                const monthDeliveries = deliveriesThisYear.find(item => item._id === month);
                return monthDeliveries ? monthDeliveries.totalDeliveries : 0;
            });

            const totalRevenueThisYearByMonth = Array.from({ length: 12 }, (_, index) => {
                const month = (index + 1);
                const monthRevenue = revenueThisYear.find(item => item._id === month);
                return monthRevenue ? monthRevenue.totalRevenue : 0;
            });
            data = {
                type: "monthly",
                delivery: deliveriesThisYearByMonth,
                orders: ordersThisYearByMonth,
                products: totalProducts,
                users: totalUsers,
                return: returnsThisYearByMonth,
                price: totalRevenueThisYearByMonth,

            };
            htmlContent = await MonthlyReport(data);
        } else if (req.query.type === 'dateRange') {


            const fromDate = new Date(req.query.fromDate);
            const toDate = new Date(req.query.toDate);
            toDate.setDate(toDate.getDate() + 1);

            const revenueByDay = await Orders.aggregate([
                {
                    $match: {
                        Delivery_date: { $gte: fromDate, $lt: toDate },
                        Order_status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$Delivery_date" } },
                        totalRevenue: { $sum: "$Total_amount" }
                    }
                }
            ]).exec();

            const ordersByDay = await Orders.aggregate([
                {
                    $match: {
                        Delivery_date: { $gte: fromDate, $lt: toDate },
                        Order_status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$Delivery_date" } },
                        totalOrders: { $sum: 1 }
                    }
                }
            ]).exec();

            const returnsByDay = await Orders.aggregate([
                {
                    $match: {
                        Delivery_date: { $gte: fromDate, $lt: toDate },
                        Order_status: 'returned'
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$Delivery_date" } },
                        totalReturns: { $sum: 1 }
                    }
                }
            ]).exec();
            const deliveriesByDay = await Orders.aggregate([
                {
                    $match: {
                        Delivery_date: { $gte: fromDate, $lt: toDate },
                        Order_status: 'delivered'
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$Delivery_date" } },
                        totalDeliveries: { $sum: 1 }
                    }
                }
            ]).exec();


            const dataByDay = revenueByDay.map(dayData => {
                const date = dayData._id;
                const ordersData = ordersByDay.find(item => item && item._id === date) || { totalOrders: 0 };
                const returnsData = returnsByDay.find(item => item && item._id === date) || { totalReturns: 0 };
                const deliveriesData = deliveriesByDay.find(item => item && item._id === date) || { totalDeliveries: 0 };
                return {
                    date,
                    type: "dateRange",
                    delivery: deliveriesData,
                    totalOrders: ordersData.totalOrders,
                    totalReturns: returnsData.totalReturns,
                    totalRevenue: dayData.totalRevenue,
                    products: totalProducts,
                    users: totalUsers
                };
            });




            htmlContent = await dateReport(dataByDay);


        }









        const options = {
            format: 'Letter',
            orientation: 'portrait',
            border: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in'
            }
        };

        pdf.create(htmlContent, options).toFile((err, file) => {
            if (err) {
                console.error(err);
                return next(error)
            }

            res.download(file.filename, 'overall_report.pdf', (err) => {
                if (err) {
                    console.error(err);

                    throw error;
                }

                fs.unlinkSync(file.filename);
            });
        });
    } catch (error) {
        console.error(error);
        return next(error)
    }
};

module.exports = {
    generateOverallReport
};