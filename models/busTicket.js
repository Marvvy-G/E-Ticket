const mongoose = require("mongoose");

const BusTicketSchema = new mongoose.Schema({
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    name: {
        type: String,
        required: true, 
    },
    amount: {
        type: Number,
        required: true, 
    },
    isUsed:{
        type: Boolean,
        default: false
    }
},
{
    timestamp: true 
});

module.exports = mongoose.model("BusTicket", BusTicketSchema);