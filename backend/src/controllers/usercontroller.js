import httpStatus from "http-status";
import {User} from "../models/usermodel.js";
import bcrypt, {hash} from "bcrypt";
import crypto from "crypto"

const login = async (req, res) => {
    const {username, password} = req.body;

    if(!username || !password) {
        return res.status(400).json({message: "Please provide"});
    }

    try {
        const user = await User.findOne({username});
        if(!user) {
            return res.status(httpStatus.NOT_FOUND).json({message: "User not found"});
        }

        let isPasswordCorrect = await bcrypt.compare(password,user.password);

        if(isPasswordCorrect)  {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({token : token});
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid Username or password"})
        }
    } catch (e) {
        return res.status(500).json({message:`Something went wrong ${e} `});
    }
}

const register = async (req, res) => {
    const {name , username, password} = req.body;

    try {
        const exisitingUser = await User.findOne({username});
        if(exisitingUser) {
            return res.status(httpStatus.FOUND).json({message:"user already exist"});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            name:name,
            username:username,
            password:hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({message:"User Registerd"});
    }catch(e) {
        res.json({message:`something went wrong ${e}`});
    }
} 

export default {login, register};
