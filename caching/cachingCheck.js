// const Redis =  require('ioredis')
// const redis = new Redis()

// const checkCaching = async(req,res,next) =>{
//     const { userId } = req.userAuth;

//     try{
//         const cachedData = await redis.get(`likedPosts:${userId}`)
//     }
//     catch(error){
//         console.error(error);
//         return res.status(500).json({message: 'Error in middleware'});
//     }

// }