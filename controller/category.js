const categories = require('../model/category')



//category page
const category = async (req, res) => {
    const categorydata = await categories.find({ isdeleted: { $ne: true } })

    res.render('./admin/categorymanagement', { data: categorydata, error: false })
}


// add category
const addcategory = async (req, res) => {
    const categoryName = req.body.categoryname.toLowerCase();

    const existingCategory = await categories.findOne({ Category: categoryName });

    if (existingCategory) {

        const categoryData = await categories.find({ isdeleted: { $ne: true } });
        res.render('./admin/categorymanagement', { data: categoryData, error: "Category already exists" });
    } else if (categoryName.trim() == "") {
        const categoryData = await categories.find({ isdeleted: { $ne: true } });
        res.render('./admin/categorymanagement', { data: categoryData, error: "Category can't be empty" });
    } else {
        const newCategory = new categories({
            Category: req.body.categoryname,
            date: new Date(),
            isdeleted: false
        });

        await newCategory.save();
        res.redirect('/admin/category');
    }
}




//post edit category page
const posteditcategory = async (req, res) => {
    const editData = req.body.edit.toLowerCase()
    let data = await categories.find({ Category: editData })
    const categorydata = await categories.find()
    if (data.length) {
        res.render('./admin/categorymanagement', { data: categorydata, error: "category already exists" })
    } else {
        const id = req.params.id;
        await categories.updateOne({ _id: id }, { $set: { Category: req.body.edit } })
        res.redirect('/admin/category')

    }
}



//delete category
const deletecategory = async (req, res) => {
    const id = req.params.id;
    await categories.deleteOne({ _id: id })
    res.redirect('/admin/category')
}

module.exports = {
    category,
    addcategory,

    posteditcategory,
    deletecategory

}