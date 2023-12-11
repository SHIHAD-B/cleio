
const errorHandler = (error, req, res, next) => {
    console.log(error.message)
    return res.render('./user/500')
}

module.exports = errorHandler