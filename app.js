const    
          express = require ("express"),
          bodyParser = require("body-parser"),
          cookieParser= require("cookie-parser"),
          session    = require("express-session"),
          mongoose   = require("mongoose"),
          methodOverride = require("method-override");
          dotenv  = require("dotenv")

          dotenv.config();


const app = express();    
const port = process.env.PORT || 5000;

//DATABASE

// mongoose.connect("mongodb+srv://bellsehr:password1234@bellsehr.bwuj4eh.mongodb.net/?retryWrites=true&w=majority");
mongoose.connect("mongodb://localhost/pretty");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(cookieParser('SecretStringForCookies'));
app.use(session({ 
    secret: "SecretStringForSession",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true
}));

//ROUTES
const
authRoute   = require("./routes/authRoute"),
busTicket   = require("./routes/busTicket"),
walletRoute = require("./routes/walletRoute")

app.use(methodOverride("_method"));
app.set("view engine", "ejs");

//Routes
app.use("/api/auth", authRoute);
app.use("/api/busticket", busTicket);
app.use("/api/wallet", walletRoute);

//INITIATION POINT
app.get("/", (req, res) =>{
    res.send("Homepage")
})



app.listen(port, function(){
    console.log("bus_ticket server side");
    });