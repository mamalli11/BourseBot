const { Router } = require("express");

const router = new Router();

const indexController = require("../controllers/indexController");

//^  @desc   Index Page
//*  @route  GET /
router.get("/", indexController.index);

//^  @desc   Buy Rite
//*  @route  POST /buy
router.post("/buy", indexController.buyRite);

module.exports = router;