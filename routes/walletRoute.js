const router = require("express").Router();
const authController = require("./../controllers/authController");
const walletController = require("./../controllers/walletControllers");
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({extended:true}));

// POST route to top up wallet
router.route("/top-up/:id").post(walletController.topUpWallet);
//Get route to top up wallet
router.route("/topup/:id").get(walletController.topup);

//wallet balance
router.route("/wallet").get(authController.protect, walletController.getWalletBalance);


module.exports = router;