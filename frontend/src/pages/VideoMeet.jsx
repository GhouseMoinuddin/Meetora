import React, { useEffect, useRef, useState } from "react";
import "../styles/videoComponent.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {io} from "socket.io-client";


const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
    "iceServers":[
        {"urls":"stun:stun.l.google.com:19302"}
    ]
}

function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();

    let [VideoAvailable, setVideoAvailable] = useState(true);
    let [AudioAvailable, setAudioAvailable] = useState(true);
    let [Video, setVideo] = useState();
    let [Audio, setAudio] = useState();
    let [Screen, setScreen] = useState();
    let [showModel, setShowModel] = useState();
    let [ScreenAvailable, setScreenAvailable]=useState();
    let [messages,setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewmessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username,setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    // if(isChrome()===false) {

    // }
    
    const getPermissions = async()=> {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});
            if(videoPermission) {
                setVideoAvailable(true);
                window.localStream = videoPermission;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = videoPermission;
                }
                setVideoAvailable(false);
            }else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});
            if(audioPermission) {
                setAudioAvailable(true);
            }else {
                setAudioAvailable(false);
            }

            if(navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            }else {
                setScreenAvailable(false);
            }

            if(VideoAvailable || AudioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video:VideoAvailable,audio:AudioAvailable});
                if(userMediaStream) {
                    window.localStream = userMediaStream;
                    if(localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

        
        } catch (error) {
            console.log("Camera/microphone access failed:",error);
            
        }
    }

    useEffect(()=>{
        getPermissions();
    },[]);

    let getUserMediaSuccess = (stream) => {

    }

    let getUserMedia=(()=>{
        if((Video && VideoAvailable) || (Audio && AudioAvailable)) {
            navigator.mediaDevices.getUserMedia({Video:Video, Audio:Audio})
            .then(getUserMediaSuccess)
            .then((stream)=>{})
            .catch((e)=>console.log(e));
        }else {
            try{
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            }catch(error) {

            }
        }
    })

    useEffect(()=>{
        if(Video!=undefined && Audio!=undefined) {
            getUserMedia();
        }
    },[Audio,Video]);

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, {secure:false});
    }

    let getMedia = () => {
        setVideo(VideoAvailable);
        setAudio(AudioAvailable);
        connectToSocketServer();
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    // const connectToSocketServer = () => {
    //     socketRef.current = io(server_url);

    //     socketRef.current.on("connect", () => {
    //         socketIdRef.current = socketRef.current.id;
    //         console.log("Socket connected:", socketRef.current.id);
    //     });

    //     socketRef.current.on("connect_error", (error) => {
    //         console.error("Socket connection failed:", error.message);
    //     });
    // };

    return (
        <div>
            {askForUsername===true ?
            <div>
                <h2>Enter your lobby</h2>
                <TextField id="outlined-basic" label="username" value={username} onChange = {e=>setUsername(e.target.value)}>
                Success
                </TextField>
                <Button variant = "contained" onClick={connect}>Connect</Button>
                <div>
                    <video ref={localVideoRef} autoPlay muted></video>
                </div>
            </div> : <></>
            }



            {/* {window.location.href} */}
        </div>
    )
}

export default VideoMeetComponent;