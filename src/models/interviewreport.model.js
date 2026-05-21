const mongoose = require('mongoose');

const technicalQuestionSchema = new mongoose.Schema({
    question :{
        type: String,
        required :[true,"Technical question is required"]
    },
    intention: {
        type: String,
        required: [true,"Intentions are required"]
    },
    answer:{
        type:String,
        required: [true,"answer is required"]
    },

},{
    _id:false
})

const behaviourQuestionSchema = new mongoose.Schema({
    question :{
        type: String,
        required :[true,"Technical question is required"]
    },
    intention: {
        type: String,
        required: [true,"Intentions are required"]
    },
    answer:{
        type:String,
        required: [true,"answer is required"]
    },

},{
    _id:false
}) 

const skillGapSchema = new mongoose.Schema({
    skill :{
        type: String,
        required :[true,"skill is required"]
    },
     severity :{
        type: String,
        enum: ["low", "medium", "high"]
     },
},{
    _id:false
})

const preparationPlanSchema =  new mongoose.Schema({
    day:{
        type:Number,
        required:[true, "day is required"]
    },
    focus:{
        type:String,
        required:[true, "focus is required"]
    },
    tasks:[{
        type: String,
        required: [true,"tasks is required"]
    }]
},{
    _id:false
})

const interviewReportSchema = new mongoose.Schema({
     jobDescription :{
        type : String,
        required: [true,"job description is required"]
     },
      resume : String,
      selfDescription :{
        type: String,
      },
      matchScore :{
        type: Number,
        min: 0,
        max:100,
      },
      technicalQuestion:[technicalQuestionSchema],
      behaviourQuestion : [behaviourQuestionSchema],
      skillGap : [skillGapSchema],
      preparationPlan : [preparationPlanSchema],
      user: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
      }
},{
    timestamps: true
})

const interviewReportModel = mongoose.model("interviewReport", interviewReportSchema)

module.exports = interviewReportModel;