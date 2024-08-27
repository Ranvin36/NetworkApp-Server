const jwt = require("jsonwebtoken")

exports.generateToken=(user) =>{
        const payload = {
            user:{
                id:user.id
            }
        }
        
        const token = jwt.sign(payload,"anykey",{
            expiresIn:'3h'
        })

        return token

}

exports.generateRefreshToken = (user) =>{
        const payload = {
            user:{
                id:user.id
            }
        }
        
        const token = jwt.sign(payload,"refresh",{
            expiresIn:'1y'
        })

        return token


}   

