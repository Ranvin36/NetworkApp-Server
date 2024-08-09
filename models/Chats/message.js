const mongoose = require("mongoose")

const MessageSchema = mongoose.Schema({
    chatRoom:[{type:mongoose.Schema.Types.ObjectId}],
    senderId:[{type:mongoose.Schema.Types.ObjectId}],
    message:{
        type:String,
        default:""
    },
    image:{
        type:String,
        default:""
    }
},{
    timestamps:true
})

const Message = mongoose.model("Message" , MessageSchema)
module.exports = Message