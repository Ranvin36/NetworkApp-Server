const globalErrhandler = ((err,req,res,next)=>{
    const status = err?.status ? err?.status : "failed"
    const message = err?.message
    const stack = err?.stack
    res.status(500).json({
        status,
        message,
        stack
    })
})

const notFound  = ((req,res,next)=>{
    const err = new Error(`Cannot find ${req.originalUrl} On This Server`)
    next(err)
})

module.exports={globalErrhandler, notFound}