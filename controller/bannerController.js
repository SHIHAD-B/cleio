const banner = require('../model/banner')
const fs = require('fs');

//banner page
const bannerpage = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        const authority = req.session.readonly;
        const bannerData = await banner.find();

        res.render('./admin/bannerManagement', { bannerData: bannerData, superadmin: superadmin, authority: authority })
    } catch (error) {
        console.log(error);
        return next(error)
    }

}

//banner upload
const bannerUpload = async (req, res, next) => {
    try {

        const image = "/banner/" + req.files["bannerImage"][0].filename;
        const bannerOne = new banner({
            Added_date: new Date(),
            Image_url: image,
            Last_edited: new Date(),
        });
        bannerOne.save()
        res.redirect('/admin/bannerManagement')
    } catch (error) {
        return next(error)
    }
}

//edit banner
const editBanner = async (req, res, next) => {
    try {
        const bannerId = req.params.id;
        const edBanner = await banner.findOne({ _id: bannerId })
        fs.unlink('public/' + edBanner.Image_url, (err) => {
        });
        const image = "/banner/" + req.files["editBannerImage"][0].filename;
        await banner.updateOne({ _id: bannerId }, { Image_url: image, Last_edited: new Date() })
        res.redirect('/admin/bannerManagement')

    } catch (error) {
        return next(error)
    }
}
//delete banner
const deleteBanner = async (req, res, next) => {
    try {
        const bannerId = req.params.id;
        const edBanner = await banner.findOne({ _id: bannerId })
        fs.unlink('public/' + edBanner.Image_url, (err) => {
        });
        await banner.deleteOne({ _id: bannerId })
        res.redirect('/admin/bannerManagement')
    } catch (error) {
        return next(error)
    }
}
module.exports = {
    bannerpage,
    bannerUpload,
    editBanner,
    deleteBanner
}