const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    busTicket: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: "BusTicket"
    }],
    firstName: {
        type: String,
        required: true, 
    },
    lastName: {
        type: String,
        required: true, 
    },
    email: {
        type: String,
        required: true, 
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    age: {
        type: String,
        required: true
    },
    password: {
        type: String,
        require: true,
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        validate: {
            //This validator will only work when registering a new user
            validator: function(val){
               return val == this.password;
            },
            message: 'Password & Confirm Password does not match'
        }
    },
    passwordChangedAt: Date,
    role: {
        type: String,
        enum: ["user", "super", "admin"],
        default: "user"
    },
    address: {
        type: String,
        require: true
    },
    number: {
        type: Number,
        require: true
    },
    wallet: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: "Wallet"
    }],
 
},
{
    timestamp: true, toJSON: {virtuals: true} 
}
);


UserSchema.virtual( "Wallet", {
    ref:"Wallet",
    foreignField: "UserId",
    localField: "_id"
})

UserSchema.virtual( "BusTicket", {
    ref:"BusTicket",
    foreignField: "UserId",
    localField: "_id"
})


UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

//encrypt the password before saving it
   this.password = await bcrypt.hash(this.password, 12);

   this.confirmPassword = undefined;
    next();
})

//COMPARE ENCRYPTED PASSWORD WITH PASSWORD IN THE DATABASE
UserSchema.methods.comparePasswordInDb = async function(password, passwordDb){
    return  await bcrypt.compare(password, passwordDb);

}

//CHECK IF PASSWORD IS CHANGED && DO NOT ALLOW A USER WHO HAS CHANGED THEIR PASSWORD TO ACCESS THE ROUTE
UserSchema.methods.isPasswordChanged = async function (JWTTimestamp){
    if (this.passwordChangedAt){
        const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
        console.log(passwordChangedTimestamp, JWTTimestamp);

      return  JWTTimestamp < passwordChangedTimestamp;
    }
    return false;
}



module.exports = mongoose.model("User", UserSchema);
