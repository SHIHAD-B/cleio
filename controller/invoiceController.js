const orders = require('../model/orders')
const puppeteer = require('puppeteer');
function generateInvoiceHtml(order) {
    let totalAmt = 0;
    const shippingAddress = order.Shipping_address;
    const billingAddress = order.Billing_address;

    const productsHtml = order.Products.map(product => {
        totalAmt += product.Product_id.Price;

        return `
            <tr>
                <td>
                    <strong>${product.Product_id.Name}</strong><br>
                    Color: ${product.color}, Size: ${product.size}
                </td>
                <td>${product.Quantity}</td>
                <td>₹${product.Product_id.Price}</td>
                <td>₹${product.Product_id.Price * product.Quantity}</td>
            </tr>
        `;
    }).join('');


    const htmlContent = `
        <html>
            <head>
                <title>Invoice for Order ${order._id}</title>
                <style>
                    /* Add your styles here */
                    body {
                        font-family: Arial, sans-serif;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }

                    th, td {
                        border: 1px solid #ddd;
                        padding: 10px;
                        text-align: left;
                    }

                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
            <h2>CLEIO</h2>
                <h2>Invoice for Order ${order._id}</h2>

                <h3>Shipping Address</h3>
                <p><strong>Name:</strong> ${shippingAddress.name}</p>
                <p><strong>Phone Number:</strong> ${shippingAddress.phone_number}</p>
                <!-- Add other shipping address details here -->

                <h3>Billing Address</h3>
                <p><strong>Name:</strong> ${billingAddress.name}</p>
                <p><strong>Phone Number:</strong> ${billingAddress.phone_number}</p>
                <!-- Add other billing address details here -->

                <h3>Products</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productsHtml}
                    </tbody>
                </table>

                <h3>Order Summary</h3>
                <p><strong>Order Status:</strong> ${order.Order_status}</p>
                <p><strong>payment Status:</strong> ${order.Payment_status}</p>
                <p><strong>payment Method:</strong> ${order.Payment_method}</p>
                <p><strong>delivery:</strong> ₹${order.delivery_amount}</p>
                <p><strong>discount:</strong> ₹${totalAmt - order.Total_amount + order.delivery_amount}</p>
                <p><strong>Total Amount:</strong> ₹${order.Total_amount}</p>
                <!-- Add other order summary details here -->
            </body>
        </html>
    `;

    return htmlContent;
}




const orderInvoice = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const orderdetail = await orders.findOne({ _id: orderId })
            .populate('Billing_address')
            .populate('Shipping_address')
            .populate('Products.Product_id');

        const invoiceHtml = generateInvoiceHtml(orderdetail);

        const browser = await puppeteer.launch({
            headless: 'new', // Explicitly set to the new Headless mode
        });

        const page = await browser.newPage();

        // Set the page content with your HTML content
        await page.setContent(invoiceHtml);

        const pdfBuffer = await page.pdf({
            format: 'Letter',
            landscape: false,
            margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
        });

        // Close the browser
        await browser.close();

        // Send the generated PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=overall_report.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.log(error);
        return next(error)
    }

}




module.exports = {
    orderInvoice
}