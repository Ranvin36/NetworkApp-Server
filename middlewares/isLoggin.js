const jwt = require("jsonwebtoken")
const User = require("../models/User/user")
const isLoggin = (req,res,next) =>{
    const token = req.headers.authorization.split(" ")[1]

    jwt.verify(token,'anykey',async(err,decode)=>{
        const userId = decode?.user?.id
        const foundUser = await User.findById(userId).select("username email _id profilePicture")
        
        req.userAuth = foundUser
        
        if(err){
            const err = new Error("Token/Invalid Token");
            next(err)
        }
        else{
            next()
        }

    })
}


module.exports = isLoggin