const User              = require("../models/user");
const Wallet            = require("../models/wallet");
const BusTicket         = require("../models/busTicket")
const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const jwt               = require("jsonwebtoken");
const CustomError       = require("./../utils/customError");
const utils             = require("util");
const signToken = id => {
                 return jwt.sign({
                        id
                        },
                        process.env.JWT_SEC,
                        {expiresIn: process.env.LOGIN_EXPIRES});
}

//SIGNUP/REGISTER USER
exports.signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);
    const wallet = await Wallet.create({ user: newUser._id, balance: 0 }); // Corrected 'wallet' to 'Wallet' and fixed 'User._id' to 'newUser._id'

    newUser.wallet = wallet._id; // Changed 'User.wallet' to 'newUser.wallet' to assign wallet to the new user
    await newUser.save();

    const token = signToken(newUser._id);
    res.redirect("/api/auth/dashboard/" + req.params.id)
    console.log(token, newUser, wallet);
    next();
});


//homepage
exports.dashboard = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate("busTicket wallet").exec();
        
        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render("dashboard.ejs", { user: user });
        console.log(user); // Log the user
    } catch (err) {
        console.log(err);
        next(err); // Pass the error to the error handling middleware
    }
};


//Get Registration page to register an admin(Conductor)
exports.registerAdmin     =     (req, res, next) => {
    res.status(200).json({
        status: "This page allows a super user to register an admin. The only way to do this is by setting up a unique page in the front end that allows that allows a super user to specify the role as admin",
    })
   };

//Get User - Sign up Page Controller
exports.signupPage     =     (req, res, next) => {
    res.render("registerP.ejs");
    next();
   };

//Get Login page controller
exports.loginPage     =     (req, res, next) => {
    res.render("login.ejs");
    next();
   };


//LOGIN USER
exports.login            =    asyncErrorHandler (async (req, res, next) => {
 const {email, password} =    req.body;
    if (!email || !password){
        const error = new CustomError("Please provide email and password", 400);
        return next(error);
    }

    const user = await User.findOne({email}).select("+password");

    //const isMatch = await user.comparePasswordInDb(password, user.password);

   //Check if user exist and password matches
   if(!user || !(await user.comparePasswordInDb(password, user.password))){
    const error = new CustomError("Incorrect Email or Password", 400);
    return next(error);
   }

    const token = signToken(
        user._id
    )
    res.redirect("/api/auth/dashboard/" + req.params.id)
    console.log(token)
    next();
})

//middleware for protecting routes
exports.protect = asyncErrorHandler (async (req, res, next) => {
    //1. Read the token and check if it exist
        const testToken = req.headers.authorization;
            let token;
        if (testToken && testToken.startsWith('bearer')){
            token = testToken.split(' ')[1];
        }
        if(!token) {
            next(new CustomError("You are not logged in", 401))
        }
    //2. Validate the token
        const decodedToken = await utils.promisify(jwt.verify)(token, process.env.JWT_SEC);
        console.log(decodedToken);
    //3. If the user exist
        const user = await User.findById(decodedToken.id);
        if (!user){
            const error = new CustomError("The user with the given token does not exist", 401);
            next(error);
        }

        const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
    //4. If the user changed password after the token was issued
       if (isPasswordChanged){
        const error = new CustomError("The password has been changed recently. Please login again", 400)
        return next(error)
       }
    //5. Allow user to access route
       req.user = user;
       next();
})

//middleware for restricting users based on their roles
exports.restrict = (...role) => {
    return(req, res, next) => {
        if (!role.includes(req.user.role)){
            const error = new CustomError("You do not have permission to perform this action", 403);
            next(error);
        }
        next();
    }
}

//GET ALL USERS
exports.getAllUsers = asyncErrorHandler (async (req, res, next) => {
    const allUsers = await User.find().populate("busTicket").exec();
    res.status(200).json({
        status: "success",
        data:
        {
           allUsers
        }
    })
});