const nodemailer = require("nodemailer")

async function SendEmail(to,otp){
    try{
        const transporter = nodemailer.createTransport({
            host:"smtp.gmail.com",
            port:587,
            secure:false,
            auth:{
                user:"ranvin.789@gmail.com",
                pass:"sbkh rgrq qbjx goxc"
            }
        })
    
        const message ={
            from:"ranvin.789@gmail.com",
            to:to,
            subject:"Social Media Mobile App Otp Verification",
            text:`Your  Otp Verification Number is ${otp} `
        }
    
        const sendOtp = await transporter.sendMail(message)
        console.log(sendOtp, "email")
    }
    catch(error){
        console.log(error)
    }

}

module.exports = SendEmail