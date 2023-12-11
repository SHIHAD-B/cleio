const categories = require('../model/category')



//category page
const category = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        const authority = req.session.readonly;
        const categorydata = await categories.find({ isdeleted: { $ne: true } })

        res.render('./admin/categorymanagement', { data: categorydata, error: false, superadmin: superadmin, authority: authority })
    } catch (error) {
        console.log(error);
        return next(error)
    }

}


// add category
const addcategory = async (req, res, next) => {
    try {
        const categoryName = req.body.categoryname.toLowerCase();

        const existingCategory = await categories.findOne({ Category: categoryName });

        if (existingCategory) {

            const categoryData = await categories.find({ isdeleted: { $ne: true } });
            res.render('./admin/categorymanagement', { data: categoryData, error: "Category already exists", superadmin: superadmin, authority: authority });
        } else if (categoryName.trim() == "") {
            const categoryData = await categories.find({ isdeleted: { $ne: true } });
            res.render('./admin/categorymanagement', { data: categoryData, error: "Category can't be empty", superadmin: superadmin, authority: authority });
        } else {
            const newCategory = new categories({
                Category: req.body.categoryname,
                date: new Date(),
                isdeleted: false
            });

            await newCategory.save();
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error);
        return next(error)
    }

}




//post edit category page
const posteditcategory = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        const authority = req.session.readonly;
        const editData = req.body.edit.toLowerCase()
        let data = await categories.find({ Category: editData })
        const categorydata = await categories.find()
        if (data.length) {
            res.render('./admin/categorymanagement', { data: categorydata, error: "category already exists", superadmin: superadmin, authority: authority })
        } else {
            const id = req.params.id;
            await categories.updateOne({ _id: id }, { $set: { Category: req.body.edit } })
            res.redirect('/admin/category')

        }
    } catch (error) {
        console.log(error);
        return next(error)
    }

}



//delete category
const deletecategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        await categories.deleteOne({ _id: id })
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error);
        return next(error)
    }

}

module.exports = {
    category,
    addcategory,
    posteditcategory,
    deletecategory

}