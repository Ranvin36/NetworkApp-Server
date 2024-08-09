const express = require("express")
const {CreateSnapShot, getSnapShots, getSnapShot, deleteSnapShot} = require("../../controllers/posts/snapShotController")
const isLoggin = require("../../middlewares/isLoggin")
const snapShotRouter = express.Router()
const multer = require("multer")
const multerS3 = require("multer-s3")
const {S3Client} = require("@aws-sdk/client-s3")

const s3 = new S3Client({
    region:'eu-north-1',
    credentials:{
        accessKeyId:'AKIA6GBMFKPRFA7Z35W4',
        secretAccessKey:'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',
    }
})


const s3Storage = multer({
    storage:multerS3({
        s3:s3,
        bucket:"socialmediastorage123",
        acl:"public-read",
        key: ((req,file,cd) =>{
            cd(null,`SnapShots/${Date.now().toString()} - ${file.originalname}`)
        })
    })
}) 

snapShotRouter.get('/',isLoggin,getSnapShots)
snapShotRouter.get('/:id',isLoggin,getSnapShot)
snapShotRouter.post('/create',isLoggin,s3Storage.single('image'),CreateSnapShot)
snapShotRouter.delete('/delete/:id',isLoggin,deleteSnapShot)

module.exports = snapShotRouter