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
            receiverData,
            lastMessage:message
        })
        await findChatRoom.save()
    }
    
    
    const sendMessage = new Message({
        chatRoom:findChatRoom._id,
        senderId:_id,
        message
    })
    findChatRoom.lastMessage = "ABCD"
    await findChatRoom.save()
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
    const findUser = await User.findById(_id)
    const blocked =[]
    findUser.blocked.forEach(blockUser => {
        blocked.push(blockUser.userId.toString())
    })
    const findChats = await ChatRoom.find({members:_id,members:{$not:{$in:blocked}},deletedBy:{$ne:_id}})

    if(!findChats){
        console.log("NO chats Available")
    }


    res.json({
        status:"Successful",
        findChats
    })
})


exports.deleteChat = (async(req,res) => {
    const {id} = req.body
    const {_id} = req.userAuth
    const updateChat = await ChatRoom.findByIdAndUpdate(id,{
        $addToSet:{deletedBy:_id}
    })
    
    await updateChat.save()
    
    res.status(201).json({
        status:"Success",
        message:"Chat Deleted Successfully"
    })
    
})

exports.deleteMessage = (async(req,res) => {
    const {id} = req.body
    const {_id} = req.userAuth
    const findMessage = await Message.find({_id:{$in:id}})
    findMessage.forEach(async(message) =>{
        if(message.senderId[0].toString() == _id.toString()){
            const findMessage = await Message.deleteOne({_id:message._id})
        }
        else{
            return res.status(403)
        }
    })
    res.status(204).json({
        status:"Successful",
        message:"Message Deleted Successfully"
    })

})
exports.blockChat= (async(req,res) =>{
    const {blockId} = req.params
    const findBlockUser = await User.findById(blockId)
    const blockUserData = {
        userId:blockId,
        username:findBlockUser.username,
        profilePicture:findBlockUser.profilePicture
    }
    const updateUser = await findByIdAndUpdate(blockId, {
        $push:{blocked:blockUserData}
    })

    await updateUser.save()

    res.status(200).json({
        status:"Success",
        message:"User Blocked Successully"
    })
})