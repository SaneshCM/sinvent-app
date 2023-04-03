import express from "express"
import { registerUser, loginUser, logoutUser, getUser, loginStatus } from "../controllers/userController.js";
import protect from "../middleWare/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getuser", protect, getUser);
router.get("/loggedin", loginStatus);


export default router;