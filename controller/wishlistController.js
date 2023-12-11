const wishlist = require('../model/wishlist');
const Users = require('../model/userdata')
const coupon = require('../model/coupon')
const productsdata = require('../model/product')


//wishlist page 
const wishlistPage = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const coupons = await coupon.find();
        const from_user = await Users.findOne({ Email: req.session.user });

        if (!from_user) {
            console.log("User not found");
            return res.redirect('/');
        }

        const userWishlist = await wishlist.findOne({ User_id: from_user._id }).populate('Product.Product_id');
        for (const item of userWishlist.Product) {
            const productDetails = await productsdata.findById(item.Product_id._id)
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


        if (!userWishlist) {

            return res.render('./user/wishlist', { products: [], coupons: coupons });
        }

        res.render('./user/wishlist', { products: userWishlist.Product, coupons: coupons });

    } catch (error) {
        console.error(error);
        return next(error)
    }
};



//add to wishlist
const add_to_wishlist = async (req, res, next) => {
    try {
        const userEmail = req.session.user;
        const productId = req.body.id;

        const user = await Users.findOne({ Email: userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let wishlists = await wishlist.findOne({
            User_id: user._id,
        });

        if (!wishlists) {
            wishlists = new wishlist({
                User_id: user._id,
                Product: [],
            });
        }

        if (!wishlists.Product) {
            wishlists.Product = [];
        }

        const existingwishItem = wishlists.Product.find(item => item.Product_id.toString() === productId);

        if (existingwishItem) {
            return res.status(200).json({ message: 'Item already in the wishlist.' });
        } else {
            wishlists.Product.push({ Product_id: productId });
            await wishlists.save();
            return res.status(200).json({ message: 'Item added to the wishlist.' });
        }
    } catch (error) {
        console.error('Error adding item to the wishlist:', error);
        return next(error)
    }
};

//delete from wishlist

const delete_wishlist = async (req, res, next) => {
    try {
        const prd_id = req.params.id;

        let user = await Users.findOne({ Email: req.session.user });
        const userWish = await wishlist.findOne({ User_id: user._id }).populate("Product.Product_id", {
            _id: 1,
            Name: 1,
            "Image.Main": 1,
            Price: 1,
            variant: 1,
            Specification: 1,
        });

        if (!req.session.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const result = await wishlist.updateOne(
            { User_id: user._id, "Product._id": prd_id },
            { $pull: { "Product": { _id: prd_id } } }
        );

        const len = userWish.Product.length;


        if (result.matchedCount > 0 && result.modifiedCount > 0) {

            return res.status(200).json({ message: "Item removed from cart", length: len, status: true });
        } else {
            return res.status(404).json({ error: "Item not found in cart" });
        }
    } catch (error) {
        console.error(error);
        return next(error)
    }
};

module.exports = {
    wishlistPage,
    add_to_wishlist,
    delete_wishlist
}