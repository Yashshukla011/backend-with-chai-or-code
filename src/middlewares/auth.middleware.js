import {Apierror} from "../utils/Apierror.js"
import  asynchandler  from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.modal.js"; 
export const verifyJWT = asynchandler(async (req, _, next) => {

    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new Apierror(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?.id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new Apierror(401, "Invalid Access Token");
    }

    req.user = user;
    next();
});