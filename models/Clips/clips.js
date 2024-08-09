const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    userId: [{type:mongoose.Schema.Types.ObjectId}],
    username:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default:""
        }
})
const ClipsSchema = mongoose.Schema({
    user:{UserSchema},
    media:{
        type:String,
        default:""
    },
    text:{
        type:String,
        default:""
    }
})


const Clips = mongoose.model("Clips",ClipsSchema)

module.exports = Clips