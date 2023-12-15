
const referral = require('../model/referal')


//referal page
const referalPage = async (req, res, next) => {
    try {
        const superadmin = req.session.superadmin;
        const authority = req.session.readonly;
        const page = req.query.page || 1;
        const itemsPerPage = 5;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        const referralDataEntire = await referral.find()
        const data = referralDataEntire[0].Activities;
        const pageData = data.slice(startIndex, endIndex);


        res.render('./admin/referaloffer', { superadmin: superadmin, currentPage: page, authority: authority, referralData: referralDataEntire, data: data, pageData: pageData })
    } catch (error) {
        next(error)
    }
}

//edit referral 
const editreferral = async (req, res, next) => {
    try {

        await referral.updateOne({}, {
            Inviter: req.body.inviterBonus,
            Inviter_status: 'active',
            Inviter_lastedit: new Date(),
            Referred_user: req.body.referredUserBonus,
            Referred_user_status: 'active',
            Referred_user_lastedit: new Date()
        }, { upsert: true })

        res.json({ success: true });
    } catch (error) {
        next(error)
    }
}

//change referred status
const refferedChange = async (req, res, next) => {
    try {
        await referral.updateOne({}, {
            $set: {
                Referred_user_status: req.body.status

            }
        })
        res.json({ success: true });
    } catch (error) {
        next(error)
    }
}
//change inviter status
const inviterChange = async (req, res, next) => {
    try {
        await referral.updateOne({}, {
            $set: {
                Inviter_status: req.body.status
            }
        })
        res.json({ success: true });
    } catch (error) {
        next(error)
    }
}
module.exports = {
    referalPage,
    editreferral,
    refferedChange,
    inviterChange
}