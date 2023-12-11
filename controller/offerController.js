const productoffer = require('../model/productoffer')
const product = require('../model/product')
const categories = require('../model/category')
const categoryoffers = require('../model/categoryoffer')

const offerpage = async (req, res, next) => {
    try {
        const productsoffer = await productoffer.find().populate("Product_id");
        const authority = req.session.readonly;
        const products = await product.find()
        const superadmin = req.session.superadmin;
        res.render('./admin/offers', { superadmin: superadmin, products: products, productsoffer: productsoffer, authority: authority })
    } catch (error) {
        return next(error)
    }
}
//add produt offer
const addProductOffer = async (req, res, next) => {
    try {
        const [product_id, product_name] = req.body.product.split(',');
        const alreadyExist = await productoffer.findOne({ Product_id: product_id })
        if (alreadyExist) {
            res.status(401).json({ message: "product offer already exist" });
        } else {


            const productsoffer = new productoffer({
                Product_id: product_id,
                product_name: product_name,
                Starts_at: req.body.Start_date,
                Expires_at: req.body.Expiration_date,
                created_at: new Date(),
                Offer: req.body.Discount_value,
                Status: 'active',
            })
            await productsoffer.save()

            await product.updateOne({ _id: product_id }, {
                $set: {
                    product_offer: productsoffer._id
                }
            })
            res.json({ success: true });
        }

    } catch (error) {
        next(error)
    }
}

//edit product offer
const edit_productoffer = async (req, res, next) => {
    try {

        const product_id = req.body.product;

        await productoffer.updateOne({ Product_id: product_id }, {
            $set: {

                Starts_at: req.body.Start_date,
                Expires_at: req.body.Expiration_date,
                Offer: req.body.Discount_value,
                Status: 'active'
            }
        })
        res.json({ success: true });
    } catch (error) {
        next(error)
    }
}
//delete prouduct offer
const delete_product_Offer = async (req, res, next) => {
    try {
        const id = req.params.id;
        await productoffer.deleteOne({ _id: id });
        res.redirect('/admin/offerManagement')
    } catch (error) {
        next(error)
    }
}

//category offer page 
const categoryoffer = async (req, res, next) => {
    try {
        const category = await categories.find()
        const categoryoffer = await categoryoffers.find()
        const superadmin = req.session.superadmin;
        const authority = req.session.readonly;
        res.render('./admin/categoryoffer', { superadmin: superadmin, category: category, categoryoffer: categoryoffer, authority: authority })
    } catch (error) {
        next(error)
    }
}

//add category offer
const addcategoryoffer = async (req, res, next) => {
    try {
        const [category_id, category_name] = req.body.category.split(',');
        const alreadyExist = await categoryoffers.findOne({ Category_id: category_id })
        if (alreadyExist) {
            res.status(401).json({ message: "category offer already exist" });
        } else {


            const newcategoryoffer = new categoryoffers({
                Category_id: category_id,
                Category_name: category_name,
                Starts_at: req.body.Start_date,
                Ends_at: req.body.Expiration_date,
                Offer: req.body.Discount_value,
                createdAt: new Date(),
                Status: 'active'
            })
            await newcategoryoffer.save()

            await product.updateMany({ "Specification.Category": category_name }, {
                $set: { category_offer: newcategoryoffer._id }
            })
            res.json({ success: true });
        }
    } catch (error) {
        next(error)
    }
}
//edit category Offer
const editCategoryoffer = async (req, res, next) => {
    try {

        await categoryoffers.updateOne({
            Category_id: req.body.category
        }, {
            $set: {
                Starts_at: req.body.Start_date,
                Ends_at: req.body.Expiration_date,
                Offer: req.body.Discount_value
            }
        })
        res.json({ success: true });
    } catch (error) {
        next(error)
    }
}
//delete category offer
const deleteCategoryoffer = async (req, res, next) => {
    try {
        const id = req.params.id
        await categoryoffers.deleteOne({ _id: id });
        res.redirect('/admin/categoryoffer')
    } catch (error) {
        next(error)
    }
}

module.exports = {
    offerpage,
    addProductOffer,
    categoryoffer,
    addcategoryoffer,
    edit_productoffer,
    delete_product_Offer,
    editCategoryoffer,
    deleteCategoryoffer

}