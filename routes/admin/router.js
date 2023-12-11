const express = require('express');
const router = express.Router();

//controllers
const admincontroller = require('../../controller/admincontroller')
const categorycontroller = require('../../controller/category')
const productcontroller = require('../../controller/product')
const couponController = require('../../controller/couponController')
const dashboardController = require('../../controller/dashboardController')
const salesReportController = require('../../controller/salesReportController')
const bannerController = require('../../controller/bannerController')
const adminManagementController = require('../../controller/adminManagementController')
const offerController = require('../../controller/offerController')
const referalControllers = require('../../controller/referalController')

//middlware
const upload = require('../../middleware/uploadimage')
const adminAuthenticated = require('../../middleware/adminAuthenticated')
const adminCheck = require('../../middleware/adminCheck')
const bannerUpload = require('../../middleware/bannerImage');
const { adminManagement } = require('../../controller/adminManagementController');
//admin dashboard
router.get('/dashboard', adminAuthenticated, dashboardController.dashboard)
//admin login
router.get('/adminlogin', adminCheck, admincontroller.addlogin)
router.get('/', admincontroller.defaultAdmin)
router.post('/adlogin', admincontroller.postlogin)
//user routes
router.get('/user', adminAuthenticated, admincontroller.userdetails)
router.get('/delete/:id', adminAuthenticated, admincontroller.deleteuser)
router.post('/edituser/:id', adminAuthenticated, admincontroller.edituser)
router.get('/active/:id', adminAuthenticated, admincontroller.activeuser)
router.get('/block/:id', adminAuthenticated, admincontroller.blockuser)
router.get('/user_search', adminAuthenticated, admincontroller.usersearch)

//banner page
router.get('/bannerManagement', adminAuthenticated, bannerController.bannerpage)
// add banner
const uploadBannerFields = [
    { name: "bannerImage", maxCount: 1 }
];
router.post('/submit-banner', bannerUpload.fields(uploadBannerFields), adminAuthenticated, bannerController.bannerUpload)
//edit banner
const editBannerFields = [
    { name: "editBannerImage", maxCount: 1 }
];
router.post('/edit-banner/:id', bannerUpload.fields(editBannerFields), adminAuthenticated, bannerController.editBanner)
//delete banner
router.post('/deleteBanner/:id', adminAuthenticated, bannerController.deleteBanner)
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

//overall sales report
router.get('/downloadOverallReport', salesReportController.generateOverallReport)

//admin management page
router.get('/adminManagement', adminAuthenticated, adminManagementController.adminManagement)
//add admin
router.post('/addadmin', adminManagementController.addAdmin)
//edit admin
router.post('/editadmin', adminManagementController.editAdmin)
//block and unblock admin
router.get('/adminblock/:id', adminAuthenticated, adminManagementController.adminBlock)
router.get('/adminunblock/:id', adminAuthenticated, adminManagementController.adminunBlock)

//delete coupon
router.post('/deleteCoupon/:id', couponController.deletecoupon)
//edit coupon
router.post('/editCoupon/:id', couponController.editcoupon)

//offer management
router.get('/offerManagement', adminAuthenticated, offerController.offerpage)
//add product offer
router.post('/addProductOffer', adminAuthenticated, offerController.addProductOffer)
//edit product offer
router.post('/editProductOffer', adminAuthenticated, offerController.edit_productoffer)
//delete product offer
router.post('/deleteOffer/:id', adminAuthenticated, offerController.delete_product_Offer)
//category offer page 
router.get('/categoryoffer', adminAuthenticated, offerController.categoryoffer)

//add category offer
router.post('/addcategoryOffer', adminAuthenticated, offerController.addcategoryoffer)
//edit category offer 
router.post('/editcategoryoffer', adminAuthenticated, offerController.editCategoryoffer)
//delete category offer
router.post('/deleteCategoryoffer/:id', adminAuthenticated, offerController.deleteCategoryoffer)

//referal page
router.get('/referal', adminAuthenticated, referalControllers.referalPage)
//edit referral
router.post('/editrefferalOffer', adminAuthenticated, referalControllers.editreferral)
//change reffered status
router.post('/changerefferedstatus', adminAuthenticated, referalControllers.refferedChange)
//change reffered status
router.post('/changeinviterstatus', adminAuthenticated, referalControllers.inviterChange)
//transaction page
router.get('/transaction', adminAuthenticated, admincontroller.transactionPage)
//logout
router.get('/logout', admincontroller.logout)
module.exports = router;