const  mongoose =  require("mongoose")

const creatorSchema = mongoose.Schema({
    creator_id: [{type:mongoose.Schema.Types.ObjectId}],
    username:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default:""
    }
})

const CommentSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true 
    },
    profilePicture:{
        type:String,
    }
})

const mediaSchema = mongoose.Schema({
    uri:{
        type:String,
        default:""
    },
    mediaType:{
        type:String,
        default:""
    }
})

const PostSchema = mongoose.Schema({
    creator : [creatorSchema],
    text:{
        type:String,
        default:""
    },
    description:{
        type:String,
        default:""
    },
    media:[mediaSchema],
    likes:[{type:mongoose.Types.ObjectId}],
    bookmarks:[{type:mongoose.Types.ObjectId}],
    comments:[CommentSchema]

},{
    timestamps:true
})


const Posts = mongoose.model("Post",PostSchema)
module.exports = Posts