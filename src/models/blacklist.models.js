const mongoose = require('mongoose'); 
const { applyTimestamps } = require('./user.model');

const tokenBlacklistTokenSchema = new mongoose.Schema({
    token :{
        type: String,
        required : [true,"token is required to be blacklisted"],
    },
    
},{timestamps:true})

const tokenBlacklistModel = mongoose.model("blacklistToken",tokenBlacklistTokenSchema);

module.exports = tokenBlacklistModel;