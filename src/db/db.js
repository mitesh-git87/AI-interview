const mongoose = require('mongoose');

async function connectDB() {
    try{
        console.log("connecting to db......")

        await mongoose.connect(process.env.MONGO_URL)
        console.log("connected succesfully to DB")
    }catch(err){
        console.log('not connected to db', err.message)
    }
} 

module.exports = connectDB;
