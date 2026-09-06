import React, { useRef, useState } from "react";
import "../styles/videoComponent.css";

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

    return (
        <div>
            {askForUsername===true ?
            <div>
                
            </div>:<></>
            }



            {/* {window.location.href} */}
        </div>
    )
}

export default VideoMeetComponent;