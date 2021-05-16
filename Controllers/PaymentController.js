const AutoBind = require("auto-bind");
const request = require("request-promise");

// const { Rite, User, Discount, Payment } = require("../models/index");

//^ اتصال به درگاه پرداخت و بررسی موفق بودن پرداخت 
class PaymentController {

  constructor() {
    AutoBind(this);
  }

  async CallBackUrl(req, res, next) {
    const payment = await Payment.findOne({ resnumber: req.query.Authority });

    if (!payment) {
      return res.status(401).send("لینک پرداخت فاقد اعتبار است");
    }

    if (payment.products.lenght == 0) {y
      
      return res.status(401).send("هیچ محصولی برای خرید انتخاب نشده است");
    }

    if (req.query.Status && req.query.Status != "OK") {
      return res.status(401).send("امکان خرید در حال حاضر وجود ندارد بعدا تلاش نمایید");
    }

    let params = {
      MerchantID: "97221328-b053-11e7-bfb0-005056a205be",
      Authority: req.query.Authority,
      Amount: payment.price,
    };

    let options = this.getOptions(
      "https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json", params
    );

    request(options).then(async (data) => {

      if (data.Status == 100) {

        await payment.set({ payment: true });

        payment.products.map(async (item) => {
          await Rite.findByIdAndUpdate(item.product, { $inc: { soldCount: 1 } });
          const user = await User.findById(payment.user);
          if (user.payCash.indexOf(item.product) === -1) {
            user.payCash.push(item.product);
            user.meRite.push(item.product)
            user.cart = null;
            await user.save();
          }
          //از تعداد کد تخفیف باقی مانده کم میکند
          await Discount.findByIdAndUpdate(cartId, { $inc: { percentage: -1 } });
          const dis = await Discount.findById(cartId)
          if (dis.count == 0) {
            dis.status = "inactive";
            await dis.save();
          }
        });

        await payment.save();

        return res.status(200).send("خرید با موفقیت انجام شد");
      } else {
        return res.status(401).send("فرآیند خرید با مشکل روبرو می باشد بعدا تلاش نمایید");
      }
    })
      .catch((err) => {
        res.status(401).send(err.message);
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
