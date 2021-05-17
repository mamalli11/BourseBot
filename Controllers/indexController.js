const path = require('path');
const request = require('request-promise');

const { IdValidator } = require('./../Utils/IdValidator');
const Users = require("../models/Users");

//^ ارسال صفحه اصلی
exports.index = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {

        if (IdValidator(id) || id.length > 12) {
            const user = await Users.findById(id);
            if (user) {
                res.render('index', { id })
            }
            else { throw 'err' }
        }
        else { throw 'err' }

    } catch (err) {
        // console.log(err);
        res.render('404');
    }
};

//^ ارسال کاربر به درگاه پرداخت
exports.buyPanel = async (req, res) => {
    try {
        const cart = req.params.code
        console.log(cart);
        const user = await Users.findById(id);
        console.log(user);

        // const fact = await Cart.findById(cart.cart);
        if (user.phone) {
            let params = {
                MerchantID: '97221328-b053-11e7-bfb0-005056a205be',
                Amount: cart == 'Gold' ? "100000" : "50000",
                CallbackURL: `http://localhost:3000/api/payment/callbackurl`,
                Description: 'خرید محصول',
                Mobile: user.phone
            }

            let options = getOptions('https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json', params);

            const data = await request(options);

            if (!data) {
                errors.push({ message: 'در حال حاضر امکان خرید وجود ندارد' });
                throw error;
            }

            // await Payment.create({
            //     user: user.id,
            //     cartId: fact,
            //     products: fact.products,
            //     resnumber: data.Authority,
            //     discount: fact.discoun,
            //     price: fact.payable,
            // })

            res.redirect(`https://www.zarinpal.com/pg/StartPay/${data.Authority}`)
        }
        else {
            res.status(400).json({ message: "قبل از خرید اطلاعات حساب کاربری را تکمیل کنید" })
        }

    } catch (err) {
        res.status(400).json({ error: err });
    }
};

let getOptions = (url, params) => {
    return {
        method: 'POST',
        url: url,
        header: {
            'cache-control': 'no-cache',
            'content-type': 'application/json'
        },
        body: params,
        json: true
    }
}