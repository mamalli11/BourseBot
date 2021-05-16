const path = require('path');
const { IdValidator } = require('./../Utils/IdValidator');
const request = require('request-promise');

const Users = require("../models/Users");

// const { Rite, User, Cart, Actors, Discount, Payment } = require("../models/index");


//^ ارسال صفحه اصلی
exports.index = async (req, res) => {
    const id = req.params.userId;
    try {
       
        if (IdValidator(id)) {
            const user = await Users.findById(id);
            if (user) {
                res.sendFile(path.join(__dirname, "..", "Views", 'index.html'));
            }
            else {
                res.render("404")
            }
        }
        

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err });
    }
};



//^ ارسال کاربر به درگاه پرداخت
exports.buyRite = async (req, res) => {
    let user;

    try {
        const cart = req.params.code

        const fact = await Cart.findById(cart.cart);
        if (user.fullname && user.fullname.length >= 3) {
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

            await Payment.create({
                user: user.id,
                cartId: fact,
                products: fact.products,
                resnumber: data.Authority,
                discount: fact.discoun,
                price: fact.payable,
            })

            const link = `https://www.zarinpal.com/pg/StartPay/${data.Authority}`;

            res.status(200).json({ message: link })
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