const express = require("express")
const {register, login, authorize, sendOtp, verifyOtp, addFollower, removeFollower, getUser,getFollowers, searchUser, changeUsername, passwordEmail, resetPassword} =  require('../../controllers/users/userContollers')
const isLoggin = require("../../middlewares/isLoggin")
const { deleteUsers } = require("../../controllers/posts/postController")
const userRouter = express.Router()


// POST REQUESTS
userRouter.post('/register' ,register)
userRouter.post('/login',login)
userRouter.post('/send-otp',isLoggin,sendOtp)
userRouter.post('/verify-otp',verifyOtp)
userRouter.post('/search-user',isLoggin,searchUser)
userRouter.post('/change-username',isLoggin,changeUsername)
userRouter.post('/password-email',passwordEmail)
userRouter.post('/reset-password',resetPassword)
userRouter.post('/add-follower/:opponentId',isLoggin,addFollower)
userRouter.delete('/remove-follower/:opponentId',isLoggin,removeFollower)
userRouter.delete('/delete-users/:userId',deleteUsers)
// userRouter.post('/authorize',isLoggin,authorize)

//GET REQUESTS
userRouter.get('/get-followers/:id',isLoggin,getFollowers)
userRouter.get('/get-user/:id',isLoggin,getUser)

module.exports  = userRouter
