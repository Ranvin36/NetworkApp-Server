const Posts = require("../../models/Posts/Posts")
const User = require("../../models/User/user")
const {io} = require("../../server")
exports.createPost = (async(req,res)=>{
    console.log("INSIDE POST")
    const {text,description} = req.body
    const {_id,username} = req.userAuth
    const findMe = await User.findById(_id)
    let imageUrl = null
    let videoUrl= null
    const fileType = req.file.mimetype.split("/")[0]
    console.log(req.file,fileType)
    if(fileType == "video"){
        videoUrl =  req.file? req.file.location : null
    }   
    else{
        imageUrl = req.file? req.file.location : null

    } 
    const creator={
        creator_id:_id,
        username:username,
        profilePicture:findMe.profilePicture
    }
    const newPost = new Posts({
        creator,
         text,
         description,
         image:imageUrl,
         video:videoUrl
    })

    console.log(newPost)
    await newPost.save()

    res.status(201).json({
        status:"Success",
        message:"Post Created Successfully"
    })
})

exports.getPosts = (async(req,res)=>{
    const page = req.query.page - 1
    const limit = 3
    const skipPage = page*limit
    
    const AllPosts = await Posts.find().limit(limit).skip(skipPage)
    res.json({
        status:"Success",
        data:AllPosts
    })
})

exports.getMyPosts = (async(req,res) =>{
    const {id} = req.params
    console.log("FROM SERVER")
    const postsByCreatorId = await Posts.find({ "creator.creator_id": id });
    console.log(postsByCreatorId)
    res.json({
        status:"Success",
        data:postsByCreatorId
    })

})


exports.deletePost = (async(req,res)=>{
    const {ids} = req.body
    const findPost = await Posts.deleteMany({_id:{$in:ids}})
    console.log(findPost)
    res.status(201).json({
        status:"Success",
        message:"Posts Deleted Successfully",
        findPost
    })
})

exports.deleteUsers = (async(req,res)=>{
    const deleteUser = req.params.userId
    const findUsers = await User.findByIdAndDelete(deleteUser)
    res.status(204).json({
        status:"Success",
        message:"Users Deleted Successfully"
    })
})

exports.likePost = (async(req,res)=>{
    const {postId} = req.params
    const alreadyLiked = await Posts.find({likes:req.userAuth._id})
    const findPost = await Posts.findByIdAndUpdate(postId,{
        $push:{likes:req.userAuth._id}
    })
   const findUser = await User.findByIdAndUpdate(req.userAuth._id , {
        $push:{likes:postId}
   })
   console.log(findUser)

    res.status(201).json({
        status:"Success",
        message:"Post Liked Successfully"
    })
    }
)

exports.unlikePost =  (async(req,res)=>{
    const {postId} = req.params
    const ifLiked = await Posts.findByIdAndUpdate(postId,{
        $pull:{likes:req.userAuth._id}
    })
    const ifLikedFromUser = await User.findByIdAndUpdate(req.userAuth._id,{
        $pull:{likes:postId}
    })

    res.json({
        status:"Success",
        message:"Post unliked successfully"
    })
})


exports.createComment = (async(req,res)=>{
   const {postId} = req.params
   const {message} = req.body
   const findPost = await Posts.findById(postId) 
   const findUser = await User.findById(req.userAuth._id)
   const uploadComment = {
        userId:req.userAuth._id,
        username:req.userAuth.username,
        message,
        profilePicture:findUser.profilePicture
   }
   console.log(uploadComment)

   findPost.comments.push(uploadComment)
   await findPost.save()

   res.status(201).json({
    status:"Success",
    message:"Comment Successfull"
   })
})


exports.deleteComment = (async(req,res)=>{
    const {id} = req.params
    const post = await Posts.findOne({ "comments._id": id });
    post.comments = post.comments.filter((comment) => comment._id != id)
    console.log(post , "Comment")
    await post.save()
    res.json({
        status:"Success"
    })
})

exports.GetLikedPosts = (async(req,res) => {
    const { IDS } =  req.body
    console.log(IDS)
    const getLikedPosts = await Posts.find({_id: {$in:IDS}})
    console.log(getLikedPosts)
    res.json({
        data:getLikedPosts
    })
})