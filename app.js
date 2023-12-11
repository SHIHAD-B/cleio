const express = require('express');
const Razorpay = require('razorpay');
require("dotenv").config()

const session = require('express-session');
const nocache = require('nocache');
const adminrouter = require('./routes/admin/router')
const userrouter = require('./routes/user/router');
const errorHandler = require('./middleware/errorHandler')
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 4000;
require('./config/config')


var instance = new Razorpay({
    key_id: process.env.rzp_key_id,
    key_secret: process.env.rzp_key_secret,
});


app.set("view engine", "ejs");
app.use(nocache());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static('Public'));

app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}));
app.use(
    "/public/productimage",
    express.static(__dirname + "/productimage")
);

app.use('/', userrouter);
app.use('/admin', adminrouter);
app.use((req, res) => {

    res.status(404).render('./user/404');
});
app.use(errorHandler)
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Server is running at http://localhost:${port}/admin`);
});

module.exports = {
    app,
    instance,
};