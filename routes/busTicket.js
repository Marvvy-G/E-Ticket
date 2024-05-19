const router = require("express").Router();
const authController = require("./../controllers/authController")
const busTicketController = require("./../controllers/busTicketController");
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({extended:true}));

router.route("/addnewbusticket/:id").post(authController.protect, busTicketController.addnewbusticket);
router.route("/admin/dashboard/:id").get(authController.protect, busTicketController.getAllTickets);
router.route("/one/:id").get(authController.protect, busTicketController.one);

router.route("/used").get(busTicketController.used);
router.route("/notUsed").get(busTicketController.notUsed);
router.route("/busticket/:id")
            .get(authController.protect, busTicketController.findTicket)
            .get(busTicketController.userandticket)
            .delete(authController.protect, authController.restrict("super", "user"), busTicketController.deleteTicket)

router.route("/bus/:id").get(authController.protect, authController.restrict("user"), busTicketController.userandticket);
router.route("/verifyAndUseTicket").post(authController.protect, authController.restrict("super", "user"), busTicketController.verifyAndUseTicket)
router.route("/getAll/:id").get(authController.protect, authController.restrict("super", "user"), busTicketController.getAll);
router.route('/search').post(busTicketController.search);
module.exports = router;