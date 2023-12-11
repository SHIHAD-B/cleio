const Users = require('../model/userdata')
const Address = require('../model/address')
const { ObjectId } = require('mongoose').Types;

const coupon = require('../model/coupon')


//address
const address = async (req, res, next) => {
    try {
        const coupons = await coupon.find();
        const user = await Users.findOne({ Email: req.session.user })
        const address = await Address.find({ User: user._id })
        res.render('./user/address', { user: user, address: address, id: false, coupons: coupons })
    } catch (error) {
        console.log(error);
        return next(error)
    }


}

//buynow address
const buynowAddress = async (req, res, next) => {
    try {
        const productid = req.query.pdid;
        req.session.buyNowProductid = productid
        const coupons = await coupon.find();
        const user = await Users.findOne({ Email: req.session.user })

        const address = await Address.find({ User: new ObjectId(user._id) })


        res.render('./user/buynowAddress', { user: user, address: address, id: false, pdid: productid, coupons: coupons })
    } catch (error) {
        console.log(error);
        return next(error)
    }

}


//billing address
const billingaddress = async (req, res, next) => {
    try {
        const id = req.query.id;
        const coupons = await coupon.find();
        const user = await Users.findOne({ Email: req.session.user })

        const address = await Address.find({ User: new ObjectId(user._id) })


        res.render('./user/billlingaddress', { user: user, address: address, id: id, coupons: coupons })

    } catch (error) {
        console.log(error);
        return next(error)
    }

}

//buynow billing address
const buynowbillingaddress = async (req, res, next) => {
    try {
        const id = req.query.id;
        const productid = req.query.pdid
        const coupons = await coupon.find();
        const user = await Users.findOne({ Email: req.session.user })

        const address = await Address.find({ User: new ObjectId(user._id) })


        res.render('./user/buynowBillingaddress', { user: user, address: address, id: id, pdid: productid, coupons: coupons })
    } catch (error) {
        console.log(error);
        return next(error)
    }


}

//add address
const addAddress = async (req, res, next) => {
    try {
        const address = new Address({
            address: req.body.address,
            alternative_phone: req.body.alternative_phone,
            city: req.body.city,
            delivery_on: req.body.delivery,
            landmark: req.body.landmark,
            locality: req.body.locality,
            name: req.body.name,
            phone_number: req.body.phone,
            pincode: req.body.pincode,
            state: req.body.state,
            type: 'shipping',
            User: req.params.id,
        })
        await address.save();
        res.redirect('/address')
    } catch (error) {
        console.log(error);
        return next(error)
    }
}
//buynowadd address
const buynowaddAddress = async (req, res, next) => {
    try {
        const pdid = req.params.pdid;
        const address = new Address({
            address: req.body.address,
            alternative_phone: req.body.alternative_phone,
            city: req.body.city,
            delivery_on: req.body.delivery,
            landmark: req.body.landmark,
            locality: req.body.locality,
            name: req.body.name,
            phone_number: req.body.phone,
            pincode: req.body.pincode,
            state: req.body.state,
            type: 'shipping',
            User: req.params.id,
        })
        await address.save();
        res.redirect('/buynowAddress' + '?pdid=' + pdid);

    } catch (error) {
        console.log(error);
        return next(error)
    }
}
//edit address
const editAddress = async (req, res, next) => {
    try {
        if (req.body.alternative_phone == null || req.body.alternative_phone == undefined) {
            const id = req.params.id;
            await Address.updateOne({ _id: id }, {
                $set: {
                    address: req.body.address,

                    city: req.body.city,
                    delivery_on: req.body.delivery,
                    landmark: req.body.landmark,
                    locality: req.body.locality,
                    name: req.body.name,
                    phone_number: req.body.phone,
                    pincode: req.body.pincode,
                    state: req.body.state,
                    type: 'shipping',

                }
            })
        } else {
            const id = req.params.id;
            await Address.updateOne({ _id: id }, {
                $set: {
                    address: req.body.address,
                    alternative_phone: req.body.alternative_phone,
                    city: req.body.city,
                    delivery_on: req.body.delivery,
                    landmark: req.body.landmark,
                    locality: req.body.locality,
                    name: req.body.name,
                    phone_number: req.body.phone,
                    pincode: req.body.pincode,
                    state: req.body.state,
                    type: 'shipping',

                }
            })
        }



        res.redirect('/address')
    } catch (error) {
        console.log(error);
        return next(error)
    }

}
//delete address
const deleteAddress = async (req, res, next) => {
    try {
        const id = req.params.id
        await Address.deleteOne({ _id: id })
        res.redirect('/address')
    } catch (error) {
        console.log(error);
        return next(error)
    }
}
module.exports = {
    address,
    addAddress,
    billingaddress,
    buynowAddress,
    buynowbillingaddress,
    editAddress,
    deleteAddress,
    buynowaddAddress
}