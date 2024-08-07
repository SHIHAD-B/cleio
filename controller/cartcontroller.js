
const cart_Collection = require('../model/cart')
const Users = require('../model/userdata')
const coupon = require('../model/coupon')
const product = require('../model/product')


// cart
const cart = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const coupons = await coupon.find();
        const from_user = await Users.findOne({ Email: req.session.user });

        if (!from_user) {

            return res.redirect('/');
        }

        const userCart = await cart_Collection.findOne({ User_id: from_user._id })
            .populate({
                path: 'Items.Product_id',
                select: 'Name Image.Main Price variant product_offer',
            })
        for (const item of userCart?.Items) {
            const productDetails = await product.findById(item.Product_id._id)
                .populate({
                    path: 'product_offer',
                    select: 'Offer Starts_at Expires_at',
                    match: { Starts_at: { $lte: currentDate }, Expires_at: { $gte: currentDate } }
                })
                .populate({
                    path: 'category_offer',
                    select: 'Offer Starts_at Ends_at',
                    match: { Starts_at: { $lte: currentDate }, Ends_at: { $gte: currentDate } }
                });

            item.Product_id.product_offer = productDetails.product_offer;
            item.Product_id.category_offer = productDetails.category_offer;
        }


        if (!userCart) {
            console.log("Cart not found for user");
            return res.render('./user/cart', { products: [], length: 0, coupons: coupons });
        }
        // res.json(userCart)
        res.render('./user/cart', { products: userCart.Items, length: userCart.Items.length, coupons: coupons });
    } catch (error) {
        console.error(error);
        return next(error)
    }
};

//delete from cart

const delete_cart = async (req, res, next) => {
    try {

        const prd_id = req.params.id;
        let user = await Users.findOne({ Email: req.session.user })

        if (!req.session.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const result = await cart_Collection.updateOne(
            { User_id: user._id, "Items._id": prd_id },
            { $pull: { "Items": { _id: prd_id } } }
        );

        if (result.nModified === 1) {

            return res.status(200).json({ message: "Item removed from cart", status: true });
        } else {

            return res.status(404).json({ error: "Item not found in cart" });
        }
    } catch (error) {

        console.error(error);
        return next(error)

    }
};

//update
const update_cart = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const newQuantity = req.body.quantity;
        const userEmail = req.session.user;
        let user = await Users.findOne({ Email: userEmail })
        const result = await cart_Collection.findOneAndUpdate(
            {

                User_id: user._id,
                "Items._id": productId
            },
            {
                $set: { "Items.$.Quantity": newQuantity }
            }
            , { new: true }
        );




        res.status(200).json({ result })

    } catch (error) {
        console.error('Update Error:', error);
        return next(error)

    }
};


//add to cart
const add_to_cart = async (req, res, next) => {
    try {


        const userEmail = req.session.user;
        const { key: productId } = req.body;
        const color = req.body.color;
        const size = req.body.size;
        const user = await Users.findOne({ Email: userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let cart = await cart_Collection.findOne({
            User_id: user._id,
        });

        if (!cart) {
            cart = new cart_Collection({
                User_id: user._id,
                Total_quantity: 0,
                Items: []
            });
        }

        const existingCartItem = cart.Items.find(item => item.Product_id.toString() === productId);

        if (existingCartItem) {
            existingCartItem.Quantity += 1;
        } else {
            cart.Items.push({ Product_id: productId, Quantity: 1, size: size, color: color });
        }

        cart.Total_quantity += 1;
        await cart.save();

        return res.status(200).json({ message: 'Item added to the cart.' });
    } catch (error) {
        console.error('Error adding item to the cart:', error);
        return next(error)
    }
};

module.exports = {
    cart,
    delete_cart,
    update_cart,
    add_to_cart
}
