const Users = require('../model/userdata')
const Address = require('../model/address')
const { ObjectId } = require('mongoose').Types;

const coupon = require('../model/coupon')


//address
const address = async (req, res) => {
    const coupons = await coupon.find();
    const user = await Users.findOne({ Email: req.session.user })
    const address = await Address.find({ User: user._id })
    res.render('./user/address', { user: user, address: address, id: false, coupons: coupons })

}

//buynow address
const buynowAddress = async (req, res) => {
    const productid = req.query.pdid;
    req.session.buyNowProductid = productid
    const coupons = await coupon.find();
    const user = await Users.findOne({ Email: req.session.user })

    const address = await Address.find({ User: new ObjectId(user._id) })


    res.render('./user/buynowAddress', { user: user, address: address, id: false, pdid: productid, coupons: coupons })
}


//billing address
const billingaddress = async (req, res) => {
    const id = req.query.id;
    const coupons = await coupon.find();
    const user = await Users.findOne({ Email: req.session.user })

    const address = await Address.find({ User: new ObjectId(user._id) })


    res.render('./user/billlingaddress', { user: user, address: address, id: id, coupons: coupons })

}

//buynow billing address
const buynowbillingaddress = async (req, res) => {
    const id = req.query.id;
    const productid = req.query.pdid
    const coupons = await coupon.find();
    const user = await Users.findOne({ Email: req.session.user })

    const address = await Address.find({ User: new ObjectId(user._id) })


    res.render('./user/buynowBillingaddress', { user: user, address: address, id: id, pdid: productid, coupons: coupons })

}

//add address
const addAddress = async (req, res) => {


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


}
//edit address
const editAddress = async (req, res) => {




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
    }

}
//delete address
const deleteAddress = async (req, res) => {
    try {
        const id = req.params.id
        await Address.deleteOne({ _id: id })
        res.redirect('/address')
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    address,
    addAddress,
    billingaddress,
    buynowAddress,
    buynowbillingaddress,
    editAddress,
    deleteAddress
}