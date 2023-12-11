const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");

const destinationFolder = "./public/productimage/";

if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, destinationFolder);
    },
    filename: function (req, file, cb) {
        const randomString = crypto.randomBytes(3).toString("hex");
        const timestamp = Date.now();
        const uniqueFile = `${timestamp}-${randomString}`;
        cb(null, uniqueFile + ".png");
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
