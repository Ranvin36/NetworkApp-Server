const mongoose = require("mongoose");

const LikeUser = mongoose.Schema({
    creator_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default:""
    }
})


// const LikeSchema = mongoose.Schema({
//         user:[LikeUser],

// })