const products = require('../model/product')
const categories = require('../model/category')
const fs = require('fs')
//product management page
const productmanagement = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        const authority = req.session.readonly;
        const data = await products.find();
        res.render('./admin/productmanagement', { data: data, superadmin: superadmin, authority: authority })
    } catch (error) {
        console.log(error);
        return next(error)
    }

}

//add product page
const addproduct = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        const category = await categories.find()
        res.render('./admin/addproduct', { category: category, superadmin: superadmin })
    } catch (error) {
        console.log(error);
        return next(error)
    }

}






//post add product

const postaddproduct = async (req, res, next) => {
    try {
        if (!req.body.productname.trim("") == "") {


            const main = "/productimage/" + req.files["mainimage"][0].filename;
            const img1 = "/productimage/" + req.files["multipleimage"][0].filename;
            const img2 = "/productimage/" + req.files["multipleimage"][1].filename;
            const img3 = "/productimage/" + req.files["multipleimage"][2].filename;



            const variants = JSON.parse(req.body.variants);
            const product = new products({
                isdeleted: false,
                Name: req.body.productname,
                Description: req.body.description,
                variant: variants,
                Image: [{

                    Child_one: img1,
                    Child_three: img3,
                    Child_two: img2,
                    Main: main,
                }],
                Status: req.body.status,
                Product_added: new Date(),
                Specification: [{

                    color: req.body.color,
                    brand: req.body.brand,
                    gender: req.body.gender,
                    Category: req.body.category
                }],
                Price: req.body.price,

                Product_details: {
                    Closure_type: req.body.closuretype,
                    Country_of_origin: req.body.countryoforigin,
                    Heel_type: req.body.heeltype,
                    Material_type: req.body.materialtype,
                    Sole_material: req.body.solematerial,
                    Style: req.body.style,
                    Water_resistance: req.body.waterresistance,
                },
            })
            try {
                await product.save();
                res.redirect('/admin/product');
            } catch (error) {
                console.error('Error adding product:', error);
                return next(error)
            }
        } else {
            res.redirect('/admin/product');
        }
    } catch (error) {
        console.log(error);
        return next(error)
    }

}

//delete product

const deleteproduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        await products.updateOne({ _id: id }, { isdeleted: true })
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error);
        return next(error)
    }

}

//recover product
const recoverproduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        await products.updateOne({ _id: id }, { isdeleted: false })
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error);
        return next(error)
    }

}

//edit product page
const editproduct = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        const id = req.params.id;
        const data = await products.find({ _id: id });
        const category = await categories.find()
        res.render('./admin/editproduct', { data: data, category: category, superadmin: superadmin })
    } catch (error) {
        console.log(error);
        return next(error)
    }
}




//post edit product page
const posteditproduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const existingProduct = await products.findOne({ _id: id });
        const variants = JSON.parse(req.body.variants);


        if (!existingProduct) {

            return res.status(404).json({ message: 'Product not found' });
        }

        for (let i = 0; i < variants.length; i++) {
            const variantSize = variants[i].size;
            const existingVariant = await products.findOne({ _id: id, "variant.size": variantSize });

            if (existingVariant) {
                const updateResult = await products.updateOne(
                    { _id: id, "variant.size": variantSize },
                    { $set: { "variant.$.quantity": variants[i].quantity } }
                );

                if (updateResult.modifiedCount !== 1) {
                    console.error('Failed to update variant quantity:', variantSize);
                }
            } else {
                await products.updateOne({ _id: id }, {
                    $push: {
                        variant: variants[i]
                    }
                })
            }
        }


        const updateData = {
            $set: {
                Name: req.body.productname,
                Description: req.body.description,

                Status: req.body.status,
                Product_added: new Date(),
                Specification: {
                    color: req.body.color,
                    brand: req.body.brand,
                    gender: req.body.gender,
                    Category: req.body.category,
                },
                Price: req.body.price,
                Product_details: {
                    Closure_type: req.body.closuretype,
                    Country_of_origin: req.body.countryoforigin,
                    Heel_type: req.body.heeltype,
                    Material_type: req.body.materialtype,
                    Sole_material: req.body.solematerial,
                    Style: req.body.style,
                    Water_resistance: req.body.waterresistance,
                },
            },

        };

        const prd = await products.findOne({ _id: id })
        await products.updateOne({ _id: id }, updateData);
        if (req.files) {
            if (req.files["mainimage"]) {
                try {
                    fs.unlinkSync("Public" + prd.Image[0].Main);

                } catch (err) {
                    console.error("Error deleting file:", err);
                }
                await products.updateOne(
                    { _id: id },
                    {
                        $set: {
                            'Image.0.Main': "/productimage/" + req.files["mainimage"][0].filename
                        }
                    }
                );
            }
            if (req.files["multipleimage"]) {
                try {
                    fs.unlinkSync("Public" + prd.Image[0].Child_one);

                } catch (err) {
                    console.error("Error deleting file:", err);
                }
                await products.updateOne(
                    { _id: id },
                    {
                        $set: {
                            'Image.0.Child_one': "/productimage/" + req.files["multipleimage"][0].filename
                        }
                    }
                );
            }
            if (req.files["multipleimage"]) {
                try {
                    fs.unlinkSync("Public" + prd.Image[0].Child_two);

                } catch (err) {
                    console.error("Error deleting file:", err);
                }
                await products.updateOne(
                    { _id: id },
                    {
                        $set: {
                            'Image.0.Child_two': "/productimage/" + req.files["multipleimage"][1].filename
                        }
                    }
                );
            }
            if (req.files["multipleimage"]) {
                try {
                    fs.unlinkSync("Public" + prd.Image[0].Child_three);

                } catch (err) {
                    console.error("Error deleting file:", err);
                }
                await products.updateOne(
                    { _id: id },
                    {
                        $set: {
                            'Image.0.Child_three': "/productimage/" + req.files["multipleimage"][2].filename
                        }
                    }
                );
            }

        }
        res.redirect('/admin/product');

    } catch (error) {
        console.log(error);
        return next(error)
    }
}

//product filter

const filterProduct = async (req, res, next) => {
    try {
        console.log(req.query);
        const { gender, categories, brand, price } = req.query;

        const filter = {};

        if (gender) {
            const genderValues = gender.split(',');
            filter['Specification.0.gender'] = { $in: genderValues };
        }

        if (categories) {
            const selectedCategories = categories.split(',');
            filter['Specification.0.Category'] = { $in: selectedCategories };
        }

        if (brand) {
            const selectedBrands = brand.split(',');
            filter['Specification.0.brand'] = { $in: selectedBrands };
        }

        if (price) {
            const [minPrice, maxPrice] = price.split('-');
            filter.Price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
        }

        const filteredProducts = await products.find(filter).exec();

        res.json(filteredProducts);
    } catch (error) {
        console.error('Error filtering products:', error);
        return next(error)
    }
};


//product search
const productSearch = async (req, res, next) => {
    try {

        const searchTerm = req.query.term;
        const regex = new RegExp(searchTerm, 'i');

        const matchingProducts = await products.find({
            isdeleted: false,
            $or: [
                { 'Name': regex },
                { 'Description': regex },
            ],
        });

        if (!matchingProducts || matchingProducts.length === 0) {
            return res.json({ message: 'No matching products found' });
        }


        const PAGE_SIZE = 10;
        const page = req.query.page || 1;

        const startIndex = (page - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;

        const paginatedProducts = matchingProducts.slice(startIndex, endIndex);

        res.json(paginatedProducts);
    } catch (error) {
        console.error('Error in product search:', error);
        return next(error)
    }
};




module.exports = {
    productmanagement,
    addproduct,
    postaddproduct,
    deleteproduct,
    editproduct,
    posteditproduct,
    recoverproduct,
    productSearch,
    filterProduct
}