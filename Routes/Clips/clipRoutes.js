const express = require("express")
const isLoggin = require("../../middlewares/isLoggin")
const { getReels, deleteClip, likeClip, getClipLikes, UnlikeClip, searchReels } = require("../../controllers/clips/clipsController")
const ClipsRouter = express.Router()

ClipsRouter.get('/',isLoggin,getReels)
ClipsRouter.get('/like/:clipId',isLoggin,getClipLikes)
ClipsRouter.post('/like/:clipId',isLoggin,likeClip)
ClipsRouter.post('/un-like/:clipId',isLoggin,UnlikeClip)
ClipsRouter.post('/search',isLoggin,searchReels)
ClipsRouter.delete('/delete/:id',isLoggin,deleteClip)

module.exports = ClipsRouter