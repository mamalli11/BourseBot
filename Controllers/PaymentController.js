const AutoBind = require("auto-bind");
const request = require("request-promise");

const Payment = require("../models/Payment");

//^ اتصال به درگاه پرداخت و بررسی موفق بودن پرداخت 
class PaymentController {

  constructor() {
    AutoBind(this)
  }

  async CallBackUrl(req, res, next) {
    const payment = await Payment.findOne({
      resnumber: req.query.Authority
    });

    if (!payment) {
      return res.render('PaymentCart', {
        Status: false,
        Message: "لینک پرداخت فاقد اعتبار است",
        ECode: 401
      });
    }

    if (payment.product.lenght == 0) {
      return res.render('PaymentCart', {
        Status: false,
        Message: "هیچ محصولی برای خرید انتخاب نشده است",
        ECode: 401
      });
    }

    if (req.query.Status && req.query.Status != "OK") {
      return res.render('PaymentCart', {
        Status: false,
        Message: "امکان خرید در حال حاضر وجود ندارد بعدا تلاش نمایید",
        ECode: 401
      });
    }

    let params = {
      MerchantID: process.env.MERCHANTID,
      Authority: req.query.Authority,
      Amount: payment.price,
    };

    let options = this.getOptions(
      "https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json", params
    );

    request(options).then(async (data) => {

      if (data.Status == 100) {

        await payment.set({
          payment: true
        });

        const user = await User.findById(payment.user);
        user.pelan = payment.product;
        await user.save();
        await payment.save();

        return res.render('PaymentCart', {
          Status: true,
          Message: "خرید با موفقیت انجام شد",
          ECode: 200
        })
      } else {
        return res.render('PaymentCart', {
          Status: false,
          Message: "فرآیند خرید با مشکل روبرو می باشد بعدا تلاش نمایید",
          ECode: 401
        });
      }
    })
      .catch((err) => {
        return res.render('PaymentCart', {
          Status: false,
          Message: err.message,
          ECode: 401
        });
      });
  }

  getOptions(url, params) {
    return {
      method: "POST",
      url: url,
      header: {
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
      body: params,
      json: true,
    };
  }
}

module.exports = new PaymentController();