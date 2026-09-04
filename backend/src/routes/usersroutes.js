import { Router } from "express";
import usercontroller from "../controllers/usercontroller.js"

const router = Router();

router.route("/login").post(usercontroller.login);
router.route("/register").post(usercontroller.register);
router.route("/add_to_activity");
router.route("/get_all_activity");

export default router;
