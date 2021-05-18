const { Router } = require("express");

const Payment = require("../controllers/PaymentController");

const router = new Router();

router.get("/payment/callbackurl", Payment.CallBackUrl);

module.exports = router;
