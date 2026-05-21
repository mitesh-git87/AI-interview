const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const tokenBlacklistModel = require('../models/blacklist.models');
const sendEmail = require('../services/email.service')
const { generateOtp, getOtpHtml } = require ('../utils/utils'); 
const otpModel = require ('../models/otp.model');


async function  registerUser(req, res) {
    const {username, email, password} = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or :[
            {username},
            {email},
        ]
    })

    if (isUserAlreadyExists){
        return res.status(401).json({message: "user already exists with same username or email"});
    }
    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password : hash,
    });
    
    const otp = generateOtp();
    const html = getOtpHtml(otp); 

    const otpHash = await bcrypt.hash(otp, 10);
    await otpModel.create({
        email,
        user : user._id,
        otpHash 
    })

    await sendEmail(email, "OTP Verification",`your otp code is ${otp}`, html)
    res.status(201).json({message: "user created succesfully",
        user : {
            id : user._id,
            username : user.username,
            email: user.email,
            verified : user.verified, 
        }
    })
}

async function loginUser(req, res) {
    const {username, email, password}= req.body;

    const user = await userModel.findOne({
        $and:[
            {username},
            {email},
        ]
    })
    if(!user){
        return res.status(401).json({message:"user does't exists with such username or email"});
    }

    if(!user.verified){
        return res.status(401).json({
            message:"email is not verified"
        })
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(401).json({message:"password mudt be valid"})
    }
     const token = jwt.sign({
        id: user._id
     },process.env.JWT_SECRET);

     res.cookie("token", token);
  
     res.status(200).json({message:"user login successfully",
        user:{
            id : user._id,
            username: user.username,
            email: user.email,
        }
     })

}

async function logoutUser(req, res) { 
     const token = req.cookies.token 
     
     if(token){
        await tokenBlacklistModel.create({token})
     } 
     res.clearCookie("token")

     res.status(200).json({message:"user logout successfully "})
    
}

async function getmeController(req, res){
    const user = await userModel.findById(req.user._id)

    res.status(200).json({
        message: "user detail fetched successfully",
        user:{
            id: user._id,
            username : user.username,
            email : user.email, 
        }
    })
}

async function verifyEmail(req, res) {
    console.log("BODY:", req.body);

    const { otp, email } = req.body || {};

    if (!otp || !email) {
        return res.status(400).json({
            message: "otp and email are required"
        });
    }
    const otpdoc = await otpModel.findOne({ email });
    const isOtpValid = await bcrypt.compare(otp, otpdoc.otpHash);

    if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

    const user = await userModel.findByIdAndUpdate(otpdoc.user,{
        verified : true 
    })

    await otpModel.deleteMany({
        user : otpdoc.user 
    })

    return res.status(200).json({
        message:"email verified successfully",
        user:{
            username: user.username,
            email : user.email,
            verified : user.verified,
        }
    })
}



module.exports = {registerUser, loginUser, logoutUser, getmeController, verifyEmail};