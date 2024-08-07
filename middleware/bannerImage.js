const multer = require("multer");
const crypto = require("crypto");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./Public/banner/");
    },
    filename: function (req, file, cb) {
        const randomeString = crypto.randomBytes(3).toString("hex");
        const timestamp = Date.now();
        const uniqueFile = `${timestamp}-${randomeString}`;
        cb(null, uniqueFile + ".png");
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;