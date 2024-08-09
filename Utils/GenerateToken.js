const jwt = require("jsonwebtoken")

const GenerateToken = (user) =>{
        const payload = {
            user:{
                id:user.id
            }
        }
        
        const token = jwt.sign(payload,"anykey",{
            expiresIn:'5h'
        })

        return token


}   

module.exports = GenerateToken