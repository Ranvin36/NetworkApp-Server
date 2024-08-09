const mongoose = require("mongoose")
const mongoDb = async() =>{
    try{
        mongoose.connect(`mongodb+srv://ranvin789:oYUBfOBLfnJgVwxT@cluster0.hfnusrs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
        console.log("Database Connected Successfully")
    }
    catch(error){
        console.log(error)
    }
}

module.exports = mongoDb