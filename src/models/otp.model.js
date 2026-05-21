const mongoose = require("mongoose");


const otpSchema = new mongoose.Schema({
    email:{
        type : String,
        required : true,
    },
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : [true,"user is required"]
    },
    otpHash:{
        type : String,
        required :[ true,"otp hashed is required"]
    },

},{
    timestamps : true
})

const otpModel = mongoose.model("otps",otpSchema)

module.exports =  otpModel; 