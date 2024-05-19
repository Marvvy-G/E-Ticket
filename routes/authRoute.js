const router = require("express").Router();
const authController = require("./../controllers/authController");
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({extended:true}));

//////////////////////////////////////////////////////////
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
/////////////////////////////////////////////////////////

//Only a super user can register admin
router.route("/registerAdmin").get(authController.protect, 
                                   authController.restrict("super"), 
                                   authController.registerAdmin);

//Only a user can sign up
router.route("/signupPage").get(authController.signupPage);
router.route("/loginPage").get(authController.loginPage);

//All Users
router.route("/getAllUsers").get(authController.getAllUsers)
//Home
router.route("/dashboard/:id").get(authController.protect, authController.dashboard)

module.exports = router;
