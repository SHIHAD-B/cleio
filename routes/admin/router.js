const express = require('express');
const router = express.Router();

//controllers
const admincontroller = require('../../controller/admincontroller')
const categorycontroller = require('../../controller/category')
const productcontroller = require('../../controller/product')
const couponController = require('../../controller/couponController')
const dashboardController = require('../../controller/dashboardController')
//middlware
const upload = require('../../middleware/uploadimage')
const adminAuthenticated = require('../../middleware/adminAuthenticated')
//admin dashboard
router.get('/', adminAuthenticated, dashboardController.dashboard)
//user routes
router.get('/user', adminAuthenticated, admincontroller.userdetails)
router.get('/delete/:id', adminAuthenticated, admincontroller.deleteuser)
router.post('/edituser/:id', adminAuthenticated, admincontroller.edituser)
router.get('/active/:id', adminAuthenticated, admincontroller.activeuser)
router.get('/block/:id', adminAuthenticated, admincontroller.blockuser)
router.get('/user_search', adminAuthenticated, admincontroller.usersearch)

//product routes
router.get('/product', adminAuthenticated, productcontroller.productmanagement)
router.get('/addproduct', adminAuthenticated, productcontroller.addproduct)
router.get('/recoverproduct/:id', adminAuthenticated, productcontroller.recoverproduct)
router.get('/deleteproduct/:id', adminAuthenticated, productcontroller.deleteproduct)
router.get('/editproduct/:id', adminAuthenticated, productcontroller.editproduct)
const uploadFields = [
    { name: "mainimage", maxCount: 1 },
    { name: "multipleimage", maxCount: 3 }
];
router.post('/addproduct', upload.fields(uploadFields), adminAuthenticated, productcontroller.postaddproduct)
router.post('/editproduct/:id', upload.fields(uploadFields), adminAuthenticated, productcontroller.posteditproduct)

//category routes
router.get('/category', adminAuthenticated, categorycontroller.category)
router.post('/addcategory', adminAuthenticated, categorycontroller.addcategory)

router.post('/editcategory/:id', adminAuthenticated, categorycontroller.posteditcategory)
router.get('/deletecategory/:id', adminAuthenticated, categorycontroller.deletecategory)


//order management
router.get('/order', adminAuthenticated, admincontroller.order)
//order details
router.get('/order_details', adminAuthenticated, admincontroller.order_details)
//order status
router.post('/update_status', adminAuthenticated, admincontroller.orderStatus)

//coupon management
router.get('/couponManagement', adminAuthenticated, couponController.couponPage)

//add coupon
router.post('/addCoupon', adminAuthenticated, couponController.addcoupon)
module.exports = router;