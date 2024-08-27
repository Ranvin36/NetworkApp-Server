const express = require("express")
const isLoggin = require("../../middlewares/isLoggin")
const { createPost, getPosts,createBookmark,removeBookmark,deletePost, likePost, unlikePost, createComment, deleteComment, getMyPosts, GetLikedPosts, getPostById, UpdatePost, searchPosts, GetBookmarkedPosts } = require("../../controllers/posts/postController")
const AWS = require("aws-sdk")
const multer = require("multer")
const multerS3 = require("multer-s3")
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { upadteProfilePic } = require("../../controllers/users/userContollers")
const { createClip } = require("../../controllers/clips/clipsController")
const postRouter = express.Router()

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




postRouter.get('/search',isLoggin,searchPosts)
postRouter.post('/create-reel',isLoggin,upload.single('image'),createClip)
postRouter.post('/create-post',isLoggin,upload.single('image'),createPost)
postRouter.post('/upload-profile-pic',isLoggin,upload.single('image'),upadteProfilePic)
postRouter.get('/get-posts',isLoggin,getPosts)
postRouter.get('/get-post/:postId',isLoggin,getPostById)
postRouter.get('/:id',isLoggin,getMyPosts)
postRouter.post('/bookmarks',isLoggin,GetBookmarkedPosts)
postRouter.post('/liked',isLoggin,GetLikedPosts)
postRouter.post('/update/:postId',isLoggin,upload.single('image'),UpdatePost)
postRouter.post('/like-posts/:postId',isLoggin,likePost)
postRouter.post('/bookmark/create/:postId',isLoggin,createBookmark)
postRouter.post('/bookmark/delete/:postId',isLoggin,removeBookmark)
postRouter.post('/unlike-posts/:postId',isLoggin,unlikePost)
postRouter.post('/add-comment/:postId',isLoggin,createComment)
postRouter.post('/delete-post',isLoggin,deletePost)
postRouter.delete('/delete-comment/:id',isLoggin,deleteComment)
// postRouter.post('/upload',upload.single('image'),(req,res)=>{
    //     res.json({
        //         status:"Success",
        //         data:req.file.location
        //     })
        // })
module.exports = postRouter
