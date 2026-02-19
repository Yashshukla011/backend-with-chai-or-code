import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connenctDB=async()=>{
    try{
const connectionINstanse=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
console.log(`mongodb connenctd !! DB HOST: ${connectionINstanse.connection.host}`);

    }catch(error){
        console.log("mongodb connenction error",error);
        process.exit(1);
    }
}
export default connenctDB;