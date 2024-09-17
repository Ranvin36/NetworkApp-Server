const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    userId: [{type:mongoose.Schema.Types.ObjectId}],
    username:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default:""
        }
})

const CommentSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true 
    },
    profilePicture:{
        type:String,
    }
})


const ClipsSchema = mongoose.Schema({
    user:[UserSchema],
    media:{
        type:String,
        default:""
    },
    text:{
        type:String,
        default:""
    },
    views:{
        type:Number,
        default:0
    },
    likes:[{type:mongoose.Types.ObjectId}],
    bookmarks:[{type:mongoose.Types.ObjectId}],
    comments:[CommentSchema]
},{
    timestamps:true
})


const Clips = mongoose.model("Clips",ClipsSchema)

module.exports = Clips