const http = require("http")
const express = require("express")
const userRouter = require('./Routes/User/userRouter')
const postRouter = require("./Routes/Posts/postRouter")
const snapShotRouter = require("./Routes/Posts/snapShotRouter")
const chatsRouter = require("./Routes/chat/chatRoute")
const reelsRouter = require("./Routes/Clips/clipRoutes")
const ChatRoom = require("./models/Chats/chatRoom")
const Message = require("./models/Chats/message")
const User = require("./models/User/user")
const Posts = require("./models/Posts/Posts")
const cors = require("cors")
const AWS = require("aws-sdk")
const multer = require("multer")
const app = express()
const server = http.createServer(app)
const socket =  require("socket.io")
const mongoose = require("mongoose")
const io = socket(server)
const port = 3001
require("./config/database")()

const corsOptions = {
    origin:'*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}

AWS.config.update({
    accessKeyId:'AKIA6GBMFKPRFA7Z35W4',
    secretAccessKey:'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',
    region:'eu-north-1'
})


io.on("connection", socket =>{
    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
      });
    
    socket.on("fetchMessages" , async({userId,opponentId}) =>{
        const member =  [opponentId,userId]
        const findChat = await ChatRoom.findOne({members:{$all:member}})
        if(findChat){
            console.log(member)
            const findMessages = await Message.find({chatRoom:findChat._id})
            
            io.emit("messages",findMessages)
        }

    })
    socket.on("chatMessage", async(msg) => {
        if(msg?.userAuth){
            const {_id,username,profilePicture} = msg.userAuth
       
            const {opponentId} = msg
            const {message} = msg
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
                })
                await findChatRoom.save()
            }
        
            const sendMessage = new Message({
                chatRoom:findChatRoom._id,
                senderId:_id,
                message
            })
        
            findChatRoom.lastMessage = message
            await findChatRoom.save()

            await sendMessage.save().then(() => {
                io.emit("receiveMessasge" ,sendMessage)
            })
        
            // socket.emit({
            //     status:"Success",
            //     message:"Message Sent Successfully",
            //     sendMessage
            // })
        }
    })
    socket.on("likePost" , async(data) =>{
        const findPost = await Posts.findByIdAndUpdate(data.postId,{
            $push:{likes:data.userId}
        })
       const findUser = await User.findByIdAndUpdate(data.userId , {
            $push:{likes:data.postId}
       })

       io.emit("receivePost",data)

    })

    socket.on("unlikePost",  async(data) =>{
        const ifLiked = await Posts.findByIdAndUpdate(data.postId,{
            $pull:{likes:data.userId}
        })
        const ifLikedFromUser = await User.findByIdAndUpdate(data.userId,{
            $pull:{likes:data.userId}
        })
        
        io.emit("receiveUnlikedPost",data)
    })

    socket.on("createComment", async(data) => {
        console.log(data)
        const {postId,message,userId} = data
        const findPost = await Posts.findById(postId) 
        const findUser = await User.findById(userId)
        const uploadComment = {
             userId:userId,
             username:findUser.username,
             message,
             profilePicture:findUser.profilePicture
        }
        console.log(uploadComment)
     
        findPost.comments.push(uploadComment)
        await findPost.save()

        io.emit("receiveComment",uploadComment)
    })

    socket.on("createBookmark" , async(data) => {
        const{userId,postId} =  data
        const findPost = await Posts.findByIdAndUpdate(postId ,{
            $push:{bookmarks:userId}
        })
    
        const findUser = await User.findByIdAndUpdate(postId,{
            $push:{bookmarks:userId}
        })

        io.emit("receiveBookmark",data)
    })

    socket.on("removeBookmark" , async(data) => {
        const {postId,userId} = data
    
        const removeFromPost = await Posts.findByIdAndUpdate(postId,{
            $pull:{bookmarks:userId}
        })
    
        const removeFromUser = await User.findByIdAndUpdate(userId,{
            $pull:{bookmarks:postId}
        })
        io.emit("receiveRemoveBookmark",data)
    })
    
    socket.on("unBlockUser" , async(data) =>{
        const {userId, opponentId} = data
        const findUserAndUpdate = await User.findByIdAndUpdate(userId, {
            $pull: {blocked: {userId: new mongoose.Types.ObjectId(opponentId)}}}
        );
        console.log(data)
        io.emit("receiveUnblockUser",data)  
    })
    socket.on('disconnect' , () =>{
        console.log("User disconnected")
    })
})

app.use(cors(corsOptions))
app.use(express.json())
app.use('/users',userRouter)
app.use('/posts',postRouter)
app.use('/chats',chatsRouter)
app.use('/reels',reelsRouter)
app.use('/snapshot',snapShotRouter)


server.listen(3001, () => {console.log(`Server Running In Port ${port}`)})

