//oYUBfOBLfnJgVwxT
const User = require("../../models/User/user")
const bcrypt = require("bcryptjs")
const {generateToken,generateRefreshToken} = require("../../Utils/GenerateToken")
const twilio = require("twilio")
const {Vonage} = require("@vonage/server-sdk") 
const SendEmail = require("../../Utils/SendEmail")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

exports.register = (async(req,res)=>{
    console.log("Recieved")
    const {username,email,password} = req.body
    console.log(username)
    const userAlreadyFound = await User.findOne({email})
    if(userAlreadyFound){
        res.status(404).json({
            status:"Unsuccessful",
            message:"User Already Found"
        })
        return
    }
    const newUser = new User({
        username,
        email,
        password
    })

    const salt = await bcrypt.genSalt(10)
    newUser.password = await bcrypt.hash(password,salt)
    await newUser.save()


    res.status(201).json({
        status:"Successfull",
        message:"User Created Successfully"
    })
})


exports.login = (async(req,res)=>{
    console.log("Inside")
    const {email,password} = req.body
    const findUser = await User.findOne({email})
    if(!findUser){
        res.status(401).json({
            status:"Unsuccessful",
            message:"Invalid Email Address Or Password"
        })
        return
    }
    const passwordCheck = await  bcrypt.compare(password,findUser.password)
    if(!passwordCheck){
        res.status(401).json({
            status:"Unsuccessful",
            message:"Invalid Email Address Or Password"
        })
        return
    }
    const refreshToken = await generateRefreshToken(findUser)
    findUser.refreshToken = refreshToken
    await findUser.save()
    res.status(201).json({
        status:"Successful",
        message:"Login Successful",
        data:findUser,
        token:generateToken(findUser)
    })
    return 
})

exports.refreshToken= (async(req,res) =>{
    const {refreshToken} = req.body
    console.log(refreshToken, "REFRESH")
    jwt.verify(refreshToken,'refresh',async(err,decode) =>{
        const findUser = await User.findById(decode.user.id)
        if(!findUser){
            return res.status(401)
        }
        res.json({
            status:"Successful",
            message:"ABCD",
            data:findUser,
            token:generateToken(findUser)
        })
    })

})


exports.getUser = (async(req,res)=>{
    console.log("INSIDE2")
    const {id} = req.params
    const findUser = await User.findOne({_id:id})

    res.json({
        data:findUser
    })
})

exports.searchUser = (async(req,res)=>{
    const {name} = req.body
    const findUser = await User.find({username:{$regex : name , $options:'i'}})

    res.json({
        data:findUser
    })
})

exports.sendOtp = (async(req,res)=>{
    const {phoneNum} = req.body;
    const otp = Math.floor(1000 + Math.random()*9000).toString()
    const {_id,username,email} = req.userAuth;
    const token = req.headers.authorization.split(" ")[1]
    console.log(otp)
    const sendOtp = await SendEmail(email,otp)
    res.status(201).json({
        message:"Otp Verification Message Sent!",
        data:{"otp":otp}
    })
})

exports.verifyOtp = (async(req,res)=>{
    const {sentOtp,receivedOtp} = req.body
    let receivedOtpString = receivedOtp.toString()
    receivedOtpString=receivedOtpString.replace(/,/g ,'')
    console.log(sentOtp,receivedOtpString)


    try{
        if(sentOtp == receivedOtpString){
            res.status(201).json({
                message:"Verification Successful"
            })
        }
        else{
            throw new Error("Invalid Otp Number")    
        }    
    }
    catch(error){
        res.status(403).json({
            message:error.message
        })
    }
})

exports.addFollower = (async(req,res)=>{
    const {_id,username,email}=req.userAuth
    const opponentId = req.params.opponentId
    const findMe = await User.findById(_id)
    const findOpponent = await User.findById(opponentId)
    if(_id == opponentId){
        console.log(_id , opponentId)
        res.status(404).json({
            message:"You cannot follow yourself"
        })
    }
    if(!findOpponent){
        res.status(404).json({
            message:"User Not Found"
        })
    }
    // const AddToFollowers = await User.findByIdAndUpdate(opponentId,{
    //     $push:{followers:_id}
    // })
    // const AddToFollowing = await User.findByIdAndUpdate(_id,{
    //     $push:{following:opponentId}
    // })

    
    const Followingdata = {
        userId:findOpponent._id,
        username:findOpponent.username,
        profilePicture:findOpponent.profilePicture,
    }
    
    const Followerdata = {
        userId:_id,
        username:findMe.username,
        profilePicture:findMe.profilePicture,
    }
    console.log(Followerdata , Followingdata)


    findOpponent.followers.push(Followerdata) 
    findMe.following.push(Followingdata) 
    await findOpponent.save()
    await findMe.save()

    res.status(201).json({
        status:"Successful",
        message:"User Added To Followers"
    })
})

exports.removeFollower = (async(req,res)=>{
    const {_id,username} = req.userAuth
    const opponentId = req.params.opponentId
    const findUser = await User.findById(_id)
    const opponentUser  = await User.findById(opponentId)
    console.log(opponentUser, _id)
    opponentUser.followers = opponentUser.followers.filter((item) => item.username != username)
    findUser.following = findUser.following.filter((item) => item.userId.toString() !== opponentId)
    await findUser.save()
    await opponentUser.save()
    res.json({
        status:"Success",
        message: findUser
    })

})


exports.upadteProfilePic = (async(req,res)=>{
    const {_id} = req.userAuth
    console.log("INSIDE")
    const file = req.file && req.file.location
    const findUser = await User.findById({_id})
    console.log(findUser,file)
    findUser.profilePicture = file
    await findUser.save()

    res.status(201).json({
        status:"Success",
        message:"Profile Picture Updated Successfully",
        file:file
    })

})


exports.getFollowers = async (req, res) => {
    try {
        const { id } = req.params;
        const getUser = await User.aggregate([
            {$match:{_id:new mongoose.Types.ObjectId(id)}},
            {
                $lookup:{
                    from: 'users',
                    localField: 'followers.userId',
                    foreignField: '_id',
                    as: 'followersDetails'
                }
            },
            {
                $lookup:{
                    from: 'users',
                    localField: 'following.userId',
                    foreignField: '_id',
                    as: 'followingDetails'
                }
            },{
                $project:{
                    followers: '$followersDetails',
                    following: '$followingDetails',
                }
            }
        ])

        res.json(getUser)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.changeUsername = (async(req,res) => {
    const {username} = req.body
    const {_id} = req.userAuth

    const findUser = await User.findById(_id)
    findUser.username = username    
    await findUser.save()

    res.status(204).json({
        status:"Success",
        message:"Username Changed Successfully"
    })
})

exports.passwordEmail = (async(req,res) =>  {
    const {email} = req.body
    console.log(email)
    const findUser = await User.find({email})
    if(!findUser){
        return
    }
    const otp = Math.floor(Math.random() * 9000).toString()
    const sendOtp = await SendEmail(email,otp)

    res.json({
        status:"Successful",
        message:"Email Sent Successfully",
        data:{"otp":otp},
        findUser
    })

})


exports.resetPassword = (async(req,res) => {
    const {newPassword , userId}  = req.body
    const findUser = await User.findById(userId)

    const salt = await bcrypt.genSalt(10)
    findUser.password = await bcrypt.hash(newPassword,salt)

    await findUser.save()

    res.json({
        status:"Success",
        message:"Password Successfully Updated"
    })
    
})

exports.verifyToken = (async(req,res) => {
    console.log(req.headers.authorization)
    const getToken = req.headers.authorization.split(" ")[1]
    jwt.verify(getToken ,"anykey" , async(err,decode)=> {
        const userId = decode?.user?.id
        const userExists = await User.findById(userId)
            if(userExists){
                res.status(200).json({
                    status:"Success",
                    message:"Valid Token"
                })
            }
            else{
                res.status(204).json({
                    status:"Unsuccessul",
                    message:"Invalid Token"
                })
                
            }
        })
    })

exports.blockUser = (async(req,res) =>{
    const {_id} = req.userAuth
    const {opponentId} = req.params
    const findUser = await User.findById(opponentId)
    const data = {
        userId:opponentId,
        username:findUser.username,
        profilePicture:findUser.profilePicture,
    }
    console.log(data)
    const findUserAndUpdate = await User.findByIdAndUpdate(_id,{
        $addToSet:{blocked:data}
    })

    res.status(200).json({
        status:"Successful",
        message:"User Blocked Successfully"
    })
})


exports.GetBlockedUsers = (async(req,res) =>{
    const {_id} = req.userAuth
    const findBlocked = await User.findById(_id).select("blocked")
    res.json({
        status:"Success",
        findBlocked
    })
})

exports.UnblockUser = (async(req,res) => {
    const {opponentId} = req.params;
    const {_id} = req.userAuth;

    const findUserAndUpdate = await User.findByIdAndUpdate(_id, {
        $pull: {blocked: {userId: new mongoose.Types.ObjectId(opponentId)}}}
    );

    res.json({
        status: "Success",
        message: "User Unblocked Successfully"
    });
});