const http = require("http")
const express = require("express")
const userRouter = require('./Routes/User/userRouter')
const postRouter = require("./Routes/Posts/postRouter")
const snapShotRouter = require("./Routes/Posts/snapShotRouter")
const chatsRouter = require("./Routes/chat/chatRoute")
const cors = require("cors")
const AWS = require("aws-sdk")
const multer = require("multer")
const app = express()
const server = http.createServer(app)
const port = 3001
const socketIo = require('socket.io')(server)
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



socketIo.on('connect' , (socket) =>{
    socketIo.on('chat-message' , (msg) =>{
        socket.emit('chat-message',msg)
    })

    socket.on('disconnect' , () =>{
        socket.disconnect()
    })
})

app.use(cors(corsOptions))
app.use(express.json())
app.use('/users',userRouter)
app.use('/posts',postRouter)
app.use('/chats',chatsRouter)
app.use('/snapshot',snapShotRouter)


server.listen(3001, () => {console.log(`Server Running In Port ${port}`)})

