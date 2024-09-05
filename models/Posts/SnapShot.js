const mongoose = require("mongoose")
const creatorSchema = mongoose.Schema({
    creator_id: [{type:mongoose.Schema.Types.ObjectId}],
    username:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default:""
    }
})

const SnapsSchema = mongoose.Schema({
    text:{
        type:String,
        default:""
    },
    image:{
        type:String,
        default:""
    },
    video:{
        type:String,
        default:""
    }
})

const SnapShotSchema = mongoose.Schema({
    creator:[creatorSchema],
    snaps:[SnapsSchema]
},{
    timestamps:true
})

const SnapShot = mongoose.model("SnapShot",SnapShotSchema)
module.exports = SnapShot