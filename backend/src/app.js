import express from "express";
import {createServer} from "node:http";

import {Server} from "socket.io";

import mongoose from "mongoose";
import ConnecttoSocket from "./controllers/socketManager.js"

import cors from "cors";
import userRoutes from "./routes/usersroutes.js"

const app = express();
const server = createServer(app);
const io = ConnecttoSocket(server);

app.set("port",(process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb", extended:true}));

app.use("/api/v1/users", userRoutes);


app.get("/home", (req,res)=> {
    return res.json({"hello":"world"});
});

const start = async () => {
    const connectionDb = await mongoose.connect("mongodb+srv://ghousemoinuddin118_db_user:Shaariq24@cluster0.jgqmn7p.mongodb.net/?appName=Cluster0");
    
    console.log(`mongo Connected DB Host: ${connectionDb.connection.host}`);
    server.listen(app.get("port"), ()=> {
        console.log("server is listening on port 8000");
    })
}

start();
