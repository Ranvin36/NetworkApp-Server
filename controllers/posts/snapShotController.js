const SnapShot = require("../../models/Posts/SnapShot")

exports.CreateSnapShot = (async(req,res) => {
    console.log("INSIDE")
    const {text} = req.body
    const {_id,username,profilePicture} = req.userAuth
    const fileLocation  = req.file ? req.file.location : null
    console.log(fileLocation)
    const creatorData={
        creator_id:_id,
        username,
        profilePicture
    }

    const newSnapShot = new SnapShot({
        creator:creatorData,
        text,
        image:fileLocation,
    }) 

    console.log(newSnapShot)

    await newSnapShot.save()

    res.status(201).json({
        status:"Success",
        message:"SnapShot Created Successfully"
    })
})

exports.getSnapShots = (async(req,res) => {
    const getSnapShots = await SnapShot.find()
    res.json({
        getSnapShots
    })
})

exports.getSnapShot = (async(req,res) => {
    const {id} = req.params
    const getSnapShots = await SnapShot.findById(id)
    res.json({
        getSnapShots
    })
})

exports.deleteSnapShot = (async(req,res) => {
    const {id} = req.params
    const deleteSnapShots = await SnapShot.findByIdAndDelete(id)
    res.status(204).json({
        status:"Success"
    })
})