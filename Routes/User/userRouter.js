const express = require("express")
const {register, login, authorize, sendOtp, verifyOtp, addFollower, removeFollower, getUser,getFollowers, searchUser, changeUsername, passwordEmail, resetPassword, verifyToken, refreshToken, blockUser, GetBlockedUsers, UnblockUser, EditUser, GetBookmarksForUser} =  require('../../controllers/users/userContollers')
const isLoggin = require("../../middlewares/isLoggin")
const { deleteUsers, searchPosts, createBookmark, removeBookmark } = require("../../controllers/posts/postController")
const AWS = require("aws-sdk")
const multer = require("multer")
const multerS3 = require("multer-s3")
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const userRouter = express.Router()


const s3Client = new S3Client({
    region:'eu-north-1',
    credentials:{
        accessKeyId:'AKIA6GBMFKPRFA7Z35W4',
        secretAccessKey:'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',
    }
})


const upload = multer({
    storage:multerS3({
        s3:s3Client,
        bucket:"socialmediastorage123",
        acl:'public-read',
        key:function(req,file,cb){
            const folder = "images"
            cb(null, `${folder}/${Date.now().toString()}-${file.originalname}`);
        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
        fieldSize: 10 * 1024 * 1024 // 10 MB
    }
})



// POST REQUESTS
userRouter.post('/edit',isLoggin,upload.single('image'),EditUser)
userRouter.post('/register' ,register)
userRouter.post('/login',login)
userRouter.post('/send-otp',isLoggin,sendOtp)
userRouter.post('/verify-otp',verifyOtp)
userRouter.post('/verify-token',verifyToken)
userRouter.post('/refresh-token',refreshToken)
userRouter.post('/search-user',isLoggin,searchUser)
userRouter.post('/change-username',isLoggin,changeUsername)
userRouter.post('/block/:opponentId',isLoggin,blockUser)
userRouter.post('/unblock/:opponentId',isLoggin,UnblockUser)
userRouter.get('/block',isLoggin,GetBlockedUsers)
userRouter.post('/password-email',passwordEmail)
userRouter.post('/reset-password',resetPassword)
userRouter.post('/add-follower/:opponentId',isLoggin,addFollower)
userRouter.delete('/remove-follower/:opponentId',isLoggin,removeFollower)
userRouter.delete('/delete-users/:userId',deleteUsers)
// userRouter.post('/authorize',isLoggin,authorize)

//GET REQUESTS
userRouter.get('/bookmarks',isLoggin,GetBookmarksForUser)
userRouter.get('/get-followers/:id',isLoggin,getFollowers)
userRouter.get('/get-user/:id',isLoggin,getUser)

module.exports  = userRouter
