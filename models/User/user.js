const mongoose = require("mongoose");
const Posts = require("../Posts/Posts")
const SnapShot = require("../Posts/SnapShot")
const ChatRoom = require("../Chats/chatRoom")
const FollowerSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    username: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ""
    }
});

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now()
    },
    bio:{
        type: String,
        default:""
    },
    profilePicture: {
        type: String,
        default: "https://socialmediastorage123.s3.eu-north-1.amazonaws.com/images/user.jpg"
    },
    likes:[{type:mongoose.Schema.Types.ObjectId}],
    bookmarks: [{type:mongoose.Schema.Types.ObjectId}],
    followers: [FollowerSchema],
    following: [FollowerSchema],
    blocked:[FollowerSchema],
    refreshToken:{
        type:String,
        default:""
    }
}, {
    timestamps: true
});

UserSchema.pre('save', async function (next){
    if(this.isModified('profilePicture')){
        this.wasNew = this.isNew
        this.modifiedProfilePicture=true
    }
})


UserSchema.post('save', async function (doc){
    if(doc.modifiedProfilePicture && !doc.wasNew){
        const userName = doc.username
        const userId  = doc._id
        const profilePicture = doc.profilePicture
        console.log(userId)
        await User.updateMany(
            {"followers.username" : userName},
            {$set :{"followers.$.profilePicture" : profilePicture}}
        )
       
        await User.updateMany(
            {"following.username" : userName},
            {$set :{"following.$.profilePicture" : profilePicture}}
        )

        await Posts.updateMany(
            {"creator.username" : userName},
            {$set: {"creator.$.profilePicture" :profilePicture}}
        )
        await SnapShot.updateMany(
            {"creator.username" : userName},
            {$set: {"creator.$.profilePicture" :profilePicture}}
        )
        await ChatRoom.updateMany(
            {"creatorData.username" : userName},
            {$set: {"creatorData.$.profilePicture" :profilePicture}}
        )
        await ChatRoom.updateMany(
            {"receiverData.username" : userName},
            {$set: {"receiverData.$.profilePicture" :profilePicture}}
        )
        console.log("UPDATED")
        
    }
})


UserSchema.pre('save', async function (next){
    if(this.isModified('username')){
        this.newUserName = this.isNew
        this.modifiedUserName=true
    }
})

UserSchema.post('save', async function (doc){
    if(doc.modifiedUserName && !doc.newUserName){
        const userName = doc.username
        const userId  = doc._id
        console.log(userId,userName)
        await User.updateMany(
            {"followers.userId" : userId},
            {$set :{"followers.$.username" : userName}}
        )
       
        await User.updateMany(
            {"following.userId" : userId},
            {$set :{"following.$.username" : userName}}
        )

        await Posts.updateMany(
            {"creator.creator_id" : userId},
            {$set: {"creator.$.username" :userName}}
        )
        await Posts.updateMany(
            {"comments.userId" : userId},
            {$set: {"comments.$.username" :userName}}
        )
        await SnapShot.updateMany(
            {"creator.creator_id" : userId},
            {$set: {"creator.$.username" :userName}}
        )
        await ChatRoom.updateMany(
            {"creatorData.userId" : userId},
            {$set: {"creatorData.$.username" :userName}}
        )
        console.log("UPDATED")
        
    }
})


const User = mongoose.model("User", UserSchema);
module.exports = User;
