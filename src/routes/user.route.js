import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshaccessTocken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middle.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverimg",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshaccessTocken)
export default router;