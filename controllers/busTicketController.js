const BusTicket = require("./../models/busTicket");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const User              = require("../models/user");
const Wallet = require("../models/wallet");
//GET A USER
exports.userandticket = asyncErrorHandler (async(req, res, next) => {
    const userandticket = await User.findById(req.params.id).populate("busTickets").exec();
    res.status(201).json({
        status: "success",
        data: {
            userandticket
        }
    })
});

//GET ALL BUS TICKET for a unique user

//profile page
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

//create a bus ticket //BUY A BUS TICKET
exports.addnewbusticket = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        const { amount, name } = req.body;

        // Check wallet balance
        const wallet = await Wallet.findOne({ user: user.id });
        if (wallet.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds in your wallet', amount });
        }

        // Deduct ticket amount from wallet balance
        wallet.balance -= amount;
        await wallet.save();

      // Generate a unique 4-digit PIN
      const generatePin = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    };

    const generateToken = () => {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    const pin = generatePin();
    const publicToken = generateToken();

    // Create ticket
    const busTicket = new BusTicket({
        user: user._id,
        name,
        amount,
        pin,
        publicToken
    });
        await busTicket.save();
        user.busTicket.push(busTicket);
        await user.save()
        res.redirect("/api/busTicket/getAll/" + req.params.id)
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

exports.getAll = async function (req, res, next) {
    try {
        const user = await User.findById(req.params.id).populate("busTicket").exec();
        
        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render("allTickets", { user: user, busTicket: BusTicket});
        console.log(user)
    } catch (err) {
        console.log(err);
        next(err); // Pass the error to the error handling middleware
    }
};


//GET ALL BUS TICKET
exports.getAllTickets = asyncErrorHandler(async (req, res, next) => {
    if (!req.user) { // Ensure 'req.user' is correctly referenced
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    try{
        const busTickets = await BusTicket.find(req.query).populate("user").exec();

    res.render("conductor", { busTickets }); // Pass busTickets with a key
} catch (err){
    console.log(err)
}
});

//search

exports.search = async (req, res) => {
    try {
        let payload = req.body.payload.trim();
        let search = await BusTicket.find({publicToken: {$regex: new RegExp('^'+payload+'.*','i')}}).populate('user').exec();

        // Limit search result to 10
        search = search.slice(0, 10);
        res.send({payload: search});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



//DELETE BUS TICKETS
exports.deleteTicket = asyncErrorHandler (async (req, res, next) => {
   await BusTicket.findByIdAndDelete(req.params.id)
    res.status(200).json({
        status: "Ticket Has Been Deleted Successfully"
    })
})

//UPDATE BUS TICKET
exports.verifyAndUseTicket = async (req, res, next) => {
    try {
        const { ticketId, pin } = req.body;

        // Find the ticket by ID
        const busTicket = await BusTicket.findById(ticketId);
        if (!busTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Check if the provided PIN matches the ticket's PIN
        if (busTicket.pin !== pin) {
            return res.status(400).json({ message: 'Invalid PIN' });
        }

        // Set the ticket as used
        busTicket.isUsed = true;
        await busTicket.save();

        res.status(200).json({ message: 'Ticket marked as used successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server error' });
    }
    next();
};


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



