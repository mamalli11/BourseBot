const { Router } = require("express");

const router = new Router();

const indexController = require("../controllers/indexController");

//^  @desc   Index Page
//*  @route  GET /
router.get("/:id", indexController.index);

//^  @desc   Buy Panel
//*  @route  GET /buy
router.get("/buy/:userId/:code", indexController.buyPanel);

module.exports = router;