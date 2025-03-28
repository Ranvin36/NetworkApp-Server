//oYUBfOBLfnJgVwxT
const User = require("../../models/User/user")
const Posts = require("../../models/Posts/Posts")
const bcrypt = require("bcryptjs")
const {generateToken,generateRefreshToken} = require("../../Utils/GenerateToken")
const twilio = require("twilio")
const {Vonage} = require("@vonage/server-sdk") 
const sendSms = require("../../Utils/SendSms")
const SendEmail = require("../../Utils/SendEmail")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")

exports.register = asyncHandler(async(req,res)=>{
    const {username,email,password} = req.body
    const userAlreadyFound = await User.findOne({email})
    if(userAlreadyFound){
       throw new Error(`User ${username} already exists`)
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


exports.login = asyncHandler(async(req,res)=>{
    const {email,password} = req.body
    const findUser = await User.findOne({email})
    if(!findUser){
        throw new Error('"Invalid Email Address Or Password"')
    }
    const passwordCheck = await  bcrypt.compare(password,findUser.password)
    if(!passwordCheck){
        throw new Error("Invalid Email Address Or Password")
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
})

exports.refreshToken= asyncHandler(async(req,res) =>{
    const {refreshToken} = req.body
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
    const {id} = req.params
    const findUser = await User.findOne({_id:id})

    res.json({
        data:findUser
    })
})

exports.searchUser = (async(req,res)=>{
    const {name} = req.body
    const findUser = await User.find({username:{$regex : name , $options:'i'}}).select("_id username profilePicture email")

    res.json({
        data:findUser
    })
})

exports.sendSms= (async(req,res) =>{
    const smsSender = await sendSms('+94767544717', 'Hello from AWS SNS!');
    console.log(smsSender)
    res.status(200).json({
        status:"Success",
        message:"SMS sent successfully",
        data:smsSender
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

exports.addFollower = asyncHandler(async(req,res)=>{
    const {_id}=req.userAuth
    const opponentId = req.params.opponentId
    const findMe = await User.findById(_id)
    const findOpponent = await User.findById(opponentId)

    if(!findOpponent) {
        throw new Error ("User not found");
    }

    if(!findOpponent){
        res.status(404).json({
            message:"User Not Found"
        })
    }
    
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


    findOpponent.followers.push(Followerdata) 
    findMe.following.push(Followingdata) 
    await findOpponent.save()
    await findMe.save()

    res.status(201).json({
        status:"Successful",
        message:"User Added To Followers"
    })
})

exports.removeFollower = asyncHandler(async(req,res)=>{
    const {_id,username} = req.userAuth
    const opponentId = req.params.opponentId
    const findUser = await User.findById(_id)
    const opponentUser  = await User.findById(opponentId)
    opponentUser.followers = opponentUser.followers.filter((item) => item.username != username)
    findUser.following = findUser.following.filter((item) => item.userId.toString() !== opponentId)
    await findUser.save()
    await opponentUser.save()
    res.json({
        status:"Success",
        message: findUser
    })

})


exports.upadteProfilePic = asyncHandler(async(req,res)=>{
    const {_id} = req.userAuth
    const file = req.file && req.file.location
    const findUser = await User.findById({_id})
    findUser.profilePicture = file
    await findUser.save()

    res.status(201).json({
        status:"Success",
        message:"Profile Picture Updated Successfully",
        file:file
    })

})


exports.getFollowers = asyncHandler(async (req, res) => {
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
                    'followersDetails.username':1,
                    'followersDetails._id':1,
                    'followersDetails.email':1,
                    'followersDetails.profilePicture':1,
                    'followingDetails.username':1,
                    'followingDetails._id':1,
                    'followingDetails.email':1,
                    'followingDetails.profilePicture':1,
                }
            }
        ])

        res.json(getUser)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})



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

exports.blockUser = asyncHandler(async(req,res) =>{
    const {_id} = req.userAuth
    const {opponentId} = req.params
    const findUser = await User.findById(opponentId)
    const data = {
        userId:opponentId,
        username:findUser.username,
        profilePicture:findUser.profilePicture,
    }
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

exports.EditUser = (async(req,res) =>{
    const token = req.headers.authorization.split(" ")[1]
    const {_id} = req.userAuth
    const {username,bio} = req.body
    const findUser = await User.findById(_id)
    if(bio){
        findUser.bio = bio
    }
    findUser.username = username
    if(req.file){
        findUser.profilePicture = req.file.location

    }
    await findUser.save()

    res.status(200).json({
        status:"Success",
        message:"Profile Updated Successfully",
        data:findUser,
        token
    })
})


exports.GetBookmarksForUser = (async(req,res) =>{
    const {_id} = req.userAuth
    const findUser = await User.findById(_id)
    const getBookmarks = await Posts.find({_id:{$in:findUser.bookmarks}}).select("creator text description updatedAt")
    res.json({
        data:getBookmarks
    })
})
