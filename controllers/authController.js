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

const createSendResponse = (user, statusCode, res, dashboardUrl) => {
    const token = signToken(user._id);

    const options = {
        max_age: process.env.LOGIN_EXPIRES * 1000, // convert to milliseconds
        httpOnly: true,
        // Add 'path' attribute if needed
        // path: '/api/auth/dashboard'
    };

    if (process.env.NODE_ENV === 'production')
        options.secure = true;

    res.cookie('jwt', token, options);

    user.password = undefined;

    res.redirect(dashboardUrl); // Use dashboardUrl for redirection
};

// SIGNUP/REGISTER USER
exports.signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const wallet = await Wallet.create({ user: User._id, balance: 0 });

    newUser.wallet = wallet._id;
    await newUser.save();

    // Check user role
    let dashboardUrl;
    if (newUser.role === 'user') {
        dashboardUrl = "/api/auth/user/dashboard/" + User._id;
    } else if (newUser.role === 'admin') {
        dashboardUrl = "/api/busticket/admin/dashboard/" + User._id;
    } else {
        const error = new CustomError("Invalid user role", 403);
        return next(error);
    }

    // Create and send response with JWT token
    createSendResponse(User, 200, res, dashboardUrl); // Pass dashboard URL to the function

    console.log(newUser, wallet);
});


//homepage
exports.dashboard = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate("busTicket wallet").exec();
      
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Count the number of used and unused tickets
        let usedTickets = 0;
        let unusedTickets = 0;
        for (const ticket of user.busTicket) {
            if (ticket.isUsed) {
                usedTickets++;
            } else {
                unusedTickets++;
            }
        }

        // Calculate the total number of tickets
        const totalTickets = user.busTicket.length;

        res.render("dashboard.ejs", { 
            user: user,
            usedTickets: usedTickets,
            unusedTickets: unusedTickets,
            totalTickets: totalTickets
        });
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


// LOGIN USER
exports.login = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        const error = new CustomError("Please provide email and password", 400);
        return next(error);
    }

    const user = await User.findOne({ email }).select("+password");

    // Check if user exists and password matches
    if (!user || !(await user.comparePasswordInDb(password, user.password))) {
        const error = new CustomError("Incorrect Email or Password", 400);
        return next(error);
    }

    // Check user role
    let dashboardUrl;
    if (user.role === 'user') {
        dashboardUrl = "/api/auth/user/dashboard/" + user._id;
    } else if (user.role === 'admin') {
        dashboardUrl = "/api/busticket/admin/dashboard/" + user._id;
    } else {
        const error = new CustomError("Invalid user role", 403);
        return next(error);
    }

    // Create and send response with JWT token
    createSendResponse(user, 200, res, dashboardUrl); // Pass dashboard URL to the function

    next();
});


//middleware for protecting routes
exports.protect = asyncErrorHandler(async (req, res, next) => {
    // 1. Read the token from the cookie
    const token = req.cookies.jwt;

    // 2. Check if the token exists
    if (!token) {
        return next(new CustomError("You are not logged in", 401));
    }

    try {
        // 3. Validate the token
        const decodedToken = await utils.promisify(jwt.verify)(token, process.env.JWT_SEC);

        // 4. Check if the user exists
        const user = await User.findById(decodedToken.id);
        if (!user) {
            return next(new CustomError("The user with the given token does not exist", 401));
        }

        // 5. Check if the user's password has been changed after token issuance
        const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
        if (isPasswordChanged) {
            return next(new CustomError("The password has been changed recently. Please login again", 400));
        }

        // 6. Allow user to access the route
        req.user = user;
        next();
    } catch (err) {
        return next(err); // Pass any error to the error handling middleware
    }
});


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