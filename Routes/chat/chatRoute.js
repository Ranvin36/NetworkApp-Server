const express = require("express")
const isLoggin = require("../../middlewares/isLoggin")
const { SendMessage, getMessage, getChats, deleteChat, deleteMessage } = require("../../controllers/chat/chatController")
const chatRouter = express.Router()

chatRouter.post('/create-chat/:opponentId',isLoggin,SendMessage)
chatRouter.get('/:opponentId',isLoggin,getMessage)
chatRouter.post('/delete',isLoggin,deleteChat)
chatRouter.post('/delete-message',isLoggin,deleteMessage)
chatRouter.get('/',isLoggin,getChats)

module.exports  = chatRouter