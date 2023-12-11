const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const BannerSchema = new Schema({
    Added_date: { type: String },
    Image_url: { type: String },
    Last_edited: { type: String },
});

const Banner = mongoose.model('Banner', BannerSchema);

module.exports = Banner;

