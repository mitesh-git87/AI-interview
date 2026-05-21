const mongoose = require('mongoose');

async function connectDB() {
    try{
        console.log("connecting to db......")

        await mongoose.connect('mongodb+srv://yt:5jw1sJEMcgLoUgQq@yt-backend.yjhapde.mongodb.net/interview')
        console.log("connected succesfully to DB")
    }catch(err){
        console.log('not connected to db', err.message)
    }
} 


module.exports = connectDB;