const express = require("express")
const isLoggin = require("../../middlewares/isLoggin")
const { getReels, deleteClip, likeClip, getClipLikes, UnlikeClip, searchReels, GetMyClips, createComment, createBookmark, removeBookmark } = require("../../controllers/clips/clipsController")
const ClipsRouter = express.Router()

ClipsRouter.get('/',isLoggin,getReels)
ClipsRouter.get('/clips/:userId',isLoggin,GetMyClips)
ClipsRouter.get('/:clipId',isLoggin,getClipLikes)
ClipsRouter.get('/like/:clipId',isLoggin,likeClip)
ClipsRouter.get('/un-like/:clipId',isLoggin,UnlikeClip)
ClipsRouter.post('/search',isLoggin,searchReels)
ClipsRouter.post('/create-comment',isLoggin,createComment)
ClipsRouter.post('/create-bookmark/:clipId',isLoggin,createBookmark)
ClipsRouter.post('/remove-bookmark/:clipId',isLoggin,removeBookmark)
ClipsRouter.delete('/delete/:id',isLoggin,deleteClip)

module.exports = ClipsRouter