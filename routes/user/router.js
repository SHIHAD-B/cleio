const express = require('express');
const router = express.Router();

//controller functions
const optController = require('../../controller/otpController')
const checkoutController = require('../../controller/checkoutController')
const addressController = require('../../controller/addressController')
const ordercontroller = require('../../controller/orderController')
const productController = require('../../controller/product')
const usercontroller = require('../../controller/usercontroller')
const cartController = require('../../controller/cartcontroller');
const walletController = require('../../controller/walletController')
const wishlistController = require('../../controller/wishlistController')
const couponController = require('../../controller/couponController')
require("dotenv").config();

//middlewares
const upload = require('../../middleware/uploadimage')
const isAuthenticated = require('../../middleware/isAuthentucated')
const isOtpCheck = require('../../middleware/isOtp')
const authenticatedUser = require('../../middleware/authenticatedUser')
const afterOrder = require('../../middleware/orderConfirmed')

router.get('/', usercontroller.defaultlanding)
//login
router.get('/login', authenticatedUser, usercontroller.getlogin)
router.post('/login', authenticatedUser, usercontroller.postlogin)

//signup
router.get('/signup', authenticatedUser, usercontroller.getsignup)
router.post('/signup', authenticatedUser, usercontroller.postsignup);
router.get('/verify-otp', authenticatedUser, optController.getotp)
router.post('/verify-otp', authenticatedUser, optController.postotp);

//home
router.get('/home', authenticatedUser, usercontroller.home)

//logout
router.get('/logout', usercontroller.logout)

//password recovery
router.get('/forgotpassword', usercontroller.forgotpassword)
router.get('/resetpassword', isOtpCheck, usercontroller.resetpassword)
router.post('/forgetpassword', authenticatedUser, usercontroller.postforgetpasswordotp);
router.get('/forgetotp', authenticatedUser, optController.forgetgetotp)
router.post('/forgetotp', authenticatedUser, optController.forgetotpcheck)
router.post('/resetpassword', usercontroller.resetpasswordpost)


//product list and product detail
router.get('/product', isAuthenticated, usercontroller.productpage)
router.get('/productdetail/:id', isAuthenticated, usercontroller.productdetails)
router.get('/productdetail/sideimage1/:id', isAuthenticated, usercontroller.sideimageone)
router.get('/productdetail/sideimage2/:id', isAuthenticated, usercontroller.sideimagetwo)
router.get('/productdetail/sideimage3/:id', isAuthenticated, usercontroller.sideimagethree)
router.get('/productdetail/sideimage4/:id', isAuthenticated, usercontroller.sideimagefour)
//product search
router.get('/productsearch', isAuthenticated, productController.productSearch)
//product filter
router.get('/api/products', isAuthenticated, productController.filterProduct)

//profile
router.get('/editprofile', isAuthenticated, usercontroller.editprofile)
router.get('/profile', isAuthenticated, usercontroller.profile)
//change password
router.post('/changePassword', isAuthenticated, usercontroller.changePassword)
//edit profile
const uploadFields = [
    { name: "profile", maxCount: 1 }

];
router.post('/editDetails', upload.any(uploadFields), isAuthenticated, usercontroller.posteditProfile)


//cart
router.get('/cart', isAuthenticated, cartController.cart)
router.post('/add_to_cart', isAuthenticated, cartController.add_to_cart)
router.get('/cart/delete/:id', isAuthenticated, cartController.delete_cart)
router.post('/cart/update/:id', isAuthenticated, cartController.update_cart)


router.get('/user/editprofile-success', isAuthenticated, usercontroller.preventedit);


//checkout
router.get('/cart/checkout', isAuthenticated, afterOrder, checkoutController.checkout)

//buynow checkout
router.get('/cart/buynowCheckout', isAuthenticated, afterOrder, checkoutController.buynowCheckout)
//delivery 
router.get('/delivery', isAuthenticated, afterOrder, checkoutController.delivery)
//buynow delivery
router.get('/buynowdelivery', isAuthenticated, afterOrder, checkoutController.buynowdelivery)
//payment
router.get('/payment', isAuthenticated, afterOrder, checkoutController.payment)
//buynow payment
router.get('/buynowPayment', isAuthenticated, afterOrder, checkoutController.buynowPayment)
//order confirmed
router.get('/order-confirmed', isAuthenticated, afterOrder, ordercontroller.order_confirmed)
//buy now order confirmed
router.get('/buynowOrderConfirmed', isAuthenticated, afterOrder, ordercontroller.buynowOrder_confirmed)
//address
router.get('/address', isAuthenticated, afterOrder, addressController.address)
router.post('/address/:id', isAuthenticated, afterOrder, addressController.addAddress)
router.get('/billingaddress', isAuthenticated, afterOrder, addressController.billingaddress)
usercontroller.deleteExpiredOTP();
//edit address
router.post('/editAddress/:id', isAuthenticated, afterOrder, addressController.editAddress)
//delete address
router.get('/deleteAddress/:id', isAuthenticated, afterOrder, addressController.deleteAddress)
//buynow address
router.get('/buynowAddress', isAuthenticated, afterOrder, addressController.buynowAddress)
router.get('/buynowBillingAddress', isAuthenticated, afterOrder, addressController.buynowbillingaddress)
//orders
router.get('/order', isAuthenticated, ordercontroller.order)
router.get('/orderDetails', isAuthenticated, ordercontroller.orderDetails)
//cancel order
router.get('/cancelOrder/:id', isAuthenticated, ordercontroller.cancelOrder)
//return order
router.get('/returnOrder/:id', isAuthenticated, ordercontroller.returnOrder)
//wallet
router.get('/wallet', isAuthenticated, walletController.walletPage)
//add money to wallet
router.post('/addMoneyToWallet', isAuthenticated, walletController.addMoneyToWallet)
//wishlist
router.get('/wishlist', isAuthenticated, wishlistController.wishlistPage)
//add to wishlist
router.post('/add_to_wishlist', isAuthenticated, wishlistController.add_to_wishlist)
//delete product from wishlist
router.get('/wishlist/delete/:id', isAuthenticated, wishlistController.delete_wishlist)
//cart razorpay
router.post('/razorpay/order', isAuthenticated, checkoutController.cart_razorpay)
//wallet razorpay
router.post('/razorpay/wallet', isAuthenticated, walletController.wallet_razorpay)
//wallet pay
router.post('/wallet/order', isAuthenticated, walletController.walletOrder)
//order back page controller
router.post('/cart/reset-order-confirmed', ordercontroller.backpageManager);
//coupon validation
router.post('/user/validate-coupon', isAuthenticated, couponController.validateCoupon)

module.exports = router