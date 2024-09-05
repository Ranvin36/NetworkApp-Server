const SnapShot = require("../../models/Posts/SnapShot")

exports.CreateSnapShot = (async(req,res) => {
    console.log("INSIDE")
    const {text} = req.body
    const {_id,username,profilePicture} = req.userAuth
    const findSnapShots = await SnapShot.findOne({"creator.creator_id" : _id})
    const fileLocation  = req.file ? req.file.location : null
    if(findSnapShots != null){
        const data={
            text,
            image:fileLocation
        }
        findSnapShots.snaps.push(data)

        await findSnapShots.save()
    }
    else{
        console.log(fileLocation)
        const creatorData={
            creator_id:_id,
            username,
            profilePicture
        }

        const snap={
            text,
            image:fileLocation
        }
    
        const newSnapShot = new SnapShot({
            creator:creatorData,
            snaps:snap
        }) 
    
        console.log(newSnapShot)
    
        await newSnapShot.save()
    }

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