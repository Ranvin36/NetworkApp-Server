const Clips = require('../../models/Clips/clips')

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
    if(alreadyExists != null){
        res.json({
            status:"Unsuccessfull",
            message:"Clip Already Liked"
        })
    }
    const findClipAndUpdate = await Clips.findByIdAndUpdate(clipId,{
        $push:{likes:_id}
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