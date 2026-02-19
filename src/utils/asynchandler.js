const asynchanldler=(requesthandler)=>{
return async(req,res,next)=>{
  Promise.resolve(requesthandler(req,res,next)).catch((err)=>next(err))
}
}
export default asynchanldler;


// const asyncHandler=(fn)=> async(req,res,next)=>{
//     try {
//       await fn(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }