const ChatRoom = require("../../models/Chats/chatRoom")
const Message = require("../../models/Chats/message")
const User = require("../../models/User/user")

exports.SendMessage  = (async(req,res) => {
    const {_id,username,profilePicture} = req.userAuth
    const {opponentId} = req.params
    const {message} = req.body
    const member = [opponentId, _id]
    const findReceiver = await User.findById(opponentId)
    let findChatRoom = await ChatRoom.findOne({members:{$all:member}})

    if(!findChatRoom){
        const creatorData = {
            userId : _id,
            username,
            profilePicture
        }
        const receiverData = {
            userId : findReceiver._id,
            username:findReceiver.username,
            profilePicture: findReceiver.profilePicture
        }
        findChatRoom = new ChatRoom({
            members:member,
            creatorData,
            receiverData
        })
        await findChatRoom.save()
        console.log(findChatRoom)
    }

    const sendMessage = new Message({
        chatRoom:findChatRoom._id,
        senderId:_id,
        message
    })

    console.log(sendMessage)

    await sendMessage.save()

    res.json({
        status:"Success",
        message:"Message Sent Successfully",
        sendMessage
    })

})


exports.getMessage = (async(req,res) => {
    const {_id} = req.userAuth
    const {opponentId} = req.params
    const member =  [opponentId,_id]
    const findChat = await ChatRoom.findOne({members:{$all:member}})
    if(findChat){
        console.log(member)
        const findMessages = await Message.find({chatRoom:findChat._id})
        res.json({
            status:"Successful",
            findMessages
            
        })
        return
    }
    res.json({
        status:"Unsuccessful",
        message:"Chat Not Found!!"
    })

})

exports.getChats = (async(req,res) =>{
    const {_id} = req.userAuth

    const findChats = await ChatRoom.find({members:_id})

    if(!findChats){
        console.log("NO chats Available")
    }


    res.json({
        status:"Successful",
        findChats
    })
})