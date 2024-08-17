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

const ChatRoomSchema = mongoose.Schema({
    members:[{type:mongoose.Schema.Types.ObjectId}],
    creatorData:[UserSchema],
    receiverData:[UserSchema],
    lastMessage:{
        type:String,
        default:""
    },
    deletedBy:[{type:mongoose.Schema.Types.ObjectId}]

},{
    timestamp:true
})

const ChatRoom = mongoose.model("ChatRoom",ChatRoomSchema)

module.exports = ChatRoom