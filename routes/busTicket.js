const router = require("express").Router();
const authController = require("./../controllers/authController")
const busTicketController = require("./../controllers/busTicketController");
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({extended:true}));

router.route("/addnewbusticket/:id").post(busTicketController.addnewbusticket);
router.route("/allbustickets").get(busTicketController.getAllTickets);
router.route("/one/:id").get(busTicketController.one);

router.route("/used").get(busTicketController.used);
router.route("/notUsed").get(busTicketController.notUsed);
router.route("/busticket/:id")
            .get(authController.protect, busTicketController.findTicket)
            .get(busTicketController.userandticket)
            .delete(authController.protect, authController.restrict("super", "user"), busTicketController.deleteTicket)

router.route("/bus/:id").get(authController.protect, authController.restrict("user"), busTicketController.userandticket);
router.route("/verifyAndUseTicket").post(busTicketController.verifyAndUseTicket)
router.route("/getAll/:id").get(busTicketController.getAll);
            
module.exports = router;