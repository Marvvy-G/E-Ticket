const BusTicket = require("./../models/busTicket");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const User              = require("../models/user");
const Wallet = require("../models/wallet");
//GET A USER
exports.userandticket = asyncErrorHandler (async(req, res, next) => {
    const userandticket = await User.findById(req.params.id).populate("BusTicket").exec();
    res.status(201).json({
        status: "success",
        data: {
            userandticket
        }
    })
});

//GET ALL BUS TICKET for a unique user
exports.getAll = async function (req, res, next) {
    try {
        const user = await User.findById(req.params.id).populate("busTicket").exec();
        
        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render("allTickets", { user: user, BusTicket: BusTicket});
        console.log(user)
    } catch (err) {
        console.log(err);
        next(err); // Pass the error to the error handling middleware
    }
};

exports.one = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render("profile.ejs", { user: user });
        console.log(user); // Log the user, not User
    } catch (err) {
        console.log(err);
        next(err); // Pass the error to the error handling middleware
    }
};


exports.getAllTickets = asyncErrorHandler (async (req, res, next) => {
    const busTickets = await BusTicket.find().populate("createdBy").exec();
    res.status(200).json({
        status: "success",
        data:
        {
            busTickets
        }
    })
});

//find Used Tickets
exports.used = asyncErrorHandler (async(req, res, next) => {
    const used = await BusTicket.find({isUsed: true}).populate("createdBy").exec();
    res.status(201).json({
        status:"Used Tickets",
        data: {
            used
        }

    })
})
    
//find Unused Tickets
exports.notUsed = asyncErrorHandler (async(req, res, next) => {
    const notUsed = await BusTicket.find({isUsed: false}).populate("createdBy").exec();
    res.status(201).json({
        status:"Fresh Tickets",
        data: {
            notUsed
        }

    })
})
    

//CREATE A BUS TICKET
// exports.addnewbusticket = asyncErrorHandler (async(req, res, next) =>{
//     const newBusTicket     = await BusTicket.create(req.body);
//     res.status(201).json({
//         status: "success",
//         data:
//         {
//             newBusTicket
//         }
//     })
// });


//create a bus ticket //BUY A BUS TICKET
exports.addnewbusticket = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        const { amount, name } = req.body;

        // Check wallet balance
        const wallet = await Wallet.findOne({ user: user.id });
        if (Wallet.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds in your wallet', amount });
        }

        // Deduct ticket amount from wallet balance
        wallet.balance -= amount;
        await wallet.save();

        // Create ticket
        const busTicket = new BusTicket({
            user,
            name,
            amount
        });
        await busTicket.save();
        res.redirect("/api/auth/dashboard/" + req.params.id)
        console.log({
            message: 'Ticket created successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server error'
        });
    } next()
};


//GET ALL BUS TICKET
exports.getAllTickets = asyncErrorHandler (async (req, res, next) => {
    const busTickets = await BusTicket.find().populate("createdBy").exec();
    res.status(200).json({
        status: "success",
        data:
        {
            busTickets
        }
    })
});

//DELETE BUS TICKETS
exports.deleteTicket = asyncErrorHandler (async (req, res, next) => {
   await BusTicket.findByIdAndDelete(req.params.id)
    res.status(200).json({
        status: "Ticket Has Been Deleted Successfully"
    })
})

//UPDATE BUS TICKET
exports.updateTicket = asyncErrorHandler (async (req, res, next) => {
    const busTicket = await BusTicket.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
    res.status(200).json({
        status: "success",
        data:
        {
            busTicket
        }
    })
})

//FIND ONE BUS TICKET
exports.findTicket = asyncErrorHandler(async (req, res, next) => {
    const busTicket = await BusTicket.findById(req.params.id).populate("createdBy");
    res.status(200).json({
        status: "success",
        data:
        {
            busTicket
        }
    })
})



