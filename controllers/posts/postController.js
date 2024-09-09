const Posts = require("../../models/Posts/Posts")
const User = require("../../models/User/user")
const {io} = require("../../server")
// const Redis  = require("redis")
// const redis = Redis.createClient({
//     host:'localhost',
//     port:6379,
// })
exports.createPost = (async(req,res)=>{
    const {text,description} = req.body
    const {_id,username} = req.userAuth
    const findMe = await User.findById(_id)
    // const fileType = req.file.mimetype.split("/")[0]
    const media = req.files ? req.files.map((file) =>({
        uri: file.location,
        mediaType: file.mimetype.split("/")[0]
    })) : null

    const creator={
        creator_id:_id,
        username:username,
        profilePicture:findMe.profilePicture
    }
    const newPost = new Posts({
        creator,
         text,
         description,
         media
    })

    console.log(newPost)
    await newPost.save()

    res.status(201).json({
        status:"Success",
        message:"Post Created Successfully"
    })
})

exports.getPosts = (async(req,res)=>{
    const {_id} = req.userAuth
    const page = req.query.page - 1
    const limit = 3
    const skipPage = page*limit
    const findUser = await User.findById(_id)
    const AllPosts = await Posts.find({"creator.creator_id":{$ne:findUser?.blocked[0]?.userId}}).limit(limit).skip(skipPage)
    res.json({
        status:"Success",
        data:AllPosts
    })
})

exports.getMyPosts = (async(req,res) =>{
    const {id} = req.params
    const postsByCreatorId = await Posts.find({ "creator.creator_id": id });
    res.json({
        status:"Success",
        data:postsByCreatorId
    })

})

exports.getPostById = (async(req,res) =>{
    const {postId} = req.params
    const findPost = await Posts.findById(postId)
    res.json({
        status:"Success",
        findPost
    })
})


exports.deletePost = (async(req,res)=>{
    const {ids} = req.body
    const findPost = await Posts.deleteMany({_id:{$in:ids}})
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
    await post.save()
    res.json({
        status:"Success"
    })
})

exports.GetLikedPosts = (async(req,res) => {
    const { IDS } =  req.body
    // const cachingEndPoint = `liked:${IDS.join(',')}`
    // if(!redis.isOpen){
    //     await redis.connect()
    // }
    // const cachedData = await redis.get(cachingEndPoint)

    // if(cachedData){
    //     console.log("INSIDE CACHING")
    //     return res.json({
    //         data:JSON.parse(cachedData)
    //         }
    //     )
    // }
    const getLikedPosts = await Posts.find({_id: {$in:IDS}})
    // await redis.set(cachingEndPoint,JSON.stringify(getLikedPosts),'EX',3600)
    res.json({
        data:getLikedPosts
    })
})

exports.GetBookmarkedPosts = (async(req,res) =>{
    console.log("INSIDE  BOOKMARKS")
    const {IDS} = req.body
    const  {_id} =  req.userAuth

    const getBookmarks = await Posts.find({_id:{$in:IDS}})
    console.log(getBookmarks)
    res.json({
        data:getBookmarks
    })
})

exports.UpdatePost = (async(req,res) => {
    const {postId} = req.params
    const {text} = req.body
    const image = req.file.location ? req.file.location : null
    const findPost = await Posts.findById(postId)
    findPost.text =  text
    findPost.image =  image
    await findPost.save()

    res.status(204).json({
        status:"Success",
        message:"Post Updated Successfully"
    })
})

exports.searchPosts = (async(req,res) =>{
    const {title} = req.query
    console.log(title)
    const findPost = await Posts.find({text:{$regex : String(title) , $options:'i'}}) 

    res.json({
        status:"Success",
        findPost
    })
})

exports.createBookmark = (async(req,res) => {
    const {postId} = req.params
    const {_id} = req.userAuth
    console.log(postId,_id)

    const findPost = await Posts.findByIdAndUpdate(postId ,{
        $push:{bookmarks:_id}
    })

    const findUser = await User.findByIdAndUpdate(_id,{
        $push:{bookmarks:postId}
    })
    res.status(201).json({
        status:"Successful",
        message:"Bookmark Created Succesfully"
    })
})

exports.removeBookmark = (async(req,res) => {
    const {postId} = req.params
    const {_id} = req.userAuth

    const removeFromPost = await Posts.findByIdAndUpdate(postId,{
        $pull:{bookmarks:_id}
    })

    const removeFromUser = await User.findByIdAndUpdate(_id,{
        $pull:{bookmarks:postId}
    })

    res.json({
        status:"Successful",
        message:"Bookmark Deleted Successfully"
    })
})