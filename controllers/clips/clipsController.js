const Clips = require('../../models/Clips/clips')
const User = require('../../models/User/user')

exports.createClip = (async(req,res) =>{
    console.log("JJJ")
    const {text} = req.body
    const {_id,username,profilePicture} = req.userAuth 
    const media = req?.file?.location
    console.log(username,media)
    const creatorData ={
        userId:_id,
        username,
        profilePicture
    }

    const newClip = new Clips({
        user:creatorData,
        text,
        media
    })

    await newClip.save()

    res.status(201).json({
        status:"Message",
        message:"Clip Created Successfully"
    })
})


exports.deleteClip = (async(req,res) => {
    const {id} = req.params
    const findAndDelete = await Clips.findByIdAndDelete(id)
    res.status(204).json({
        status:"Success",
        message:"Reel Deleted Successfully"
    })
})


exports.getReels = (async(req,res) =>{
    const GetAllReels = await Clips.find({})
    res.status(200).json({
        status:"Success",
        GetAllReels
    })
}) 

exports.likeClip = (async(req,res) =>{
    const  {clipId}=  req.params
    const  {_id} = req.userAuth
    const alreadyExists = await Clips.find({likes:_id})
    // if(alreadyExists){
    //     return res.json({
    //         status:"Unsuccessfull",
    //         message:"Clip Already Liked"
    //     })
    // }
    const findClipAndUpdate = await Clips.findByIdAndUpdate(clipId,{
        $push:{likes:_id}
    })

    const findUserAndUpdate = await User.findByIdAndUpdate(_id,{
        $push:{clips:clipId}
    })
    res.status(200).json({
        status:"Success",
        message:"Clip Liked Successfully"
    })
})

exports.UnlikeClip = (async(req,res) => {
    const  {clipId}=  req.params
    const  {_id} = req.userAuth
    const removeLike = await Clips.findByIdAndUpdate(clipId,{
        $pull:{likes:_id}
    })
    const removeUserAndUpdate = await User.findByIdAndUpdate(_id,{
        $pull:{clips:clipId}
    })


    res.status(200).json({
        status:"Success",
        message:"Clip Unliked Successfully"
    })
})

exports.getClipLikes   = (async(req,res) => {
    const {clipId}= req.params
    const {_id} = req.userAuth

    const findClipLikes = await Clips.findById(clipId).select('likes')

    res.status(200).json({
        status:"Success",
        findClipLikes
    })
})

exports.searchReels = (async(req,res) =>{
    const {title} = req.query
    const findReels = await Clips.find({text:{$regex:title , $options:'i'}})
    
    res.status(200).json({
        status:"Success",
        findReels
    })

})

exports.GetMyClips = (async(req,res) =>{
    const {userId} = req.params
    const findClip = await Clips.findOne({"user.userId":userId})
    console.log(findClip)

    res.status(200).json({
        status:"Success",
        findClip
    })
})

exports.createComment = (async(req,res) =>{
    const {_id,} = req.userAuth
    const {clipId, message} = req.body
    const findUser = await User.findById(_id)

    const data={
        userId:_id,
        profilePicture:findUser.profilePicture,
        username:findUser.username,
        message
    }

    const findClipAndUpdate = await Clips.findById(clipId)
    console.log(findClipAndUpdate)
    if(!findClipAndUpdate){
        return res.status(404)
        
    }
    findClipAndUpdate.comments.push(data)
    await findClipAndUpdate.save()
    res.status(201).json({
        status:"Successful"
    })
})

exports.createBookmark = (async(req,res) =>{
    const {_id} = req.userAuth
    const {clipId} =  req.params
    console.log(clipId,_id)
    const findReelAndUpdate = await Clips.findByIdAndUpdate(clipId ,{
        $push:{bookmarks:_id}
    })
    const findUserAnddUpdate = await User.findByIdAndUpdate(_id ,{
        $push:{clipBookmarks:clipId}
    })

    res.json({
        status:"Success",
        message:"Bookmark Created Successfully"
    })
})

exports.removeBookmark = (async(req,res) =>{
    const  {_id} = req.userAuth 
    const  {clipId} = req.params
    
    const findClipAndRemove = await Clips.findByIdAndUpdate(clipId ,{
        $pull:{bookmarks:_id}
    })
    
    const findUserAndRemove = await User.findByIdAndUpdate(_id ,{
        $pull:{clipBookmarks:clipId}
    })
    res.json({
        status:"Success",
        message:"Bookmark Removed Successfully"
    })

})