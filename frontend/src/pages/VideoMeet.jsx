import React, { useEffect, useRef, useState } from "react";
import "../styles/videoComponent.module.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { io } from "socket.io-client";
import styles from "../styles/videoComponent.module.css";


const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
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
    let [ScreenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewmessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const [socketId, setSocketId] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    const silence = () => {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const destination = oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        return Object.assign(destination.stream.getAudioTracks()[0], { enabled: false });
    };

    const black = ({ width = 640, height = 480 } = {}) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").fillRect(0, 0, width, height);

        const stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    // if(isChrome()===false) {

    // }

    const getPermissions = async () => {
        try {
            let videoPerm = false;
            let audioPerm = false;
            
            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoStream) {
                    videoPerm = true;
                    videoStream.getTracks().forEach(track => track.stop());
                }
            } catch (err) {
                console.log("Video permission denied/failed", err);
            }

            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (audioStream) {
                    audioPerm = true;
                    audioStream.getTracks().forEach(track => track.stop());
                }
            } catch (err) {
                console.log("Audio permission denied/failed", err);
            }

            setVideoAvailable(videoPerm);
            setAudioAvailable(audioPerm);

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoPerm || audioPerm) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoPerm, audio: audioPerm });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log("Camera/microphone access failed:", error);
        }
    }

    useEffect(() => {
        getPermissions();
    }, []);

    useEffect(() => {
        if (!askForUsername && localVideoRef.current && window.localStream) {
            localVideoRef.current.srcObject = window.localStream;
        }
    }, [askForUsername]);

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (error) {
            console.log(error);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
                    })
                    .catch((error) => console.log(error));
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop());
            } catch (error) {
                console.log(error);
            }

            //TODO Black silence

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
                        }).catch((error) => {
                            console.log(error);
                        })
                })
            }

        })
    }

    let getUserMedia = (() => {
        if ((Video && VideoAvailable) || (Audio && AudioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: Video, audio: Audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch (error) {

            }
        }
    })

    useEffect(() => {
        if (Video !== undefined && Audio !== undefined) {
            getUserMedia();
        }
    }, [Audio, Video]);

    //TODO
    const gotMessageFromServer = (fromId, message) => {
        const signal = JSON.parse(message);

        if (signal.ice) {
            connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(error => console.log(error));
        }

        if (fromId === socketIdRef.current || !signal.sdp) return;

        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
            .then(() => {
                if (signal.sdp.type === "offer") {
                    return connections[fromId].createAnswer();
                }
            })
            .then((description) => {
                if (!description) return;
                return connections[fromId].setLocalDescription(description);
            })
            .then(() => {
                socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: connections[fromId].localDescription })
                );
            })
            .catch((error) => console.error(error));
    };



    //TODO add Message
    let addMessage = () => {

    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on("connect", () => {
            socketIdRef.current = socketRef.current.id
            setSocketId(socketRef.current.id)
            socketRef.current.emit("join-call", window.location.href)

            socketRef.current.on("chat-message", addMessage)

            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((video) => video.socketID !== id))
            })
            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    if (connections[socketListId] !== undefined) return;
                    if (socketListId === socketIdRef.current) return;

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].ontrack = (event) => {
                        let stream = event.streams[0];
                        let videoExists = videoRef.current.find((video) => video.socketID === socketListId);

                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(v =>
                                    v.socketID === socketListId ? { ...v, stream: stream } : v
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            })
                        } else {
                            let newVideo = {
                                socketID: socketListId,
                                stream: stream,
                                autoPlay: true,
                                playsinline: true
                            }

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            })
                        }

                    };
                    if (window.localStream !== undefined && window.localStream !== null) {
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    } else {
                        //TODO BLACKSILENCE
                        // let blackSilence 

                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue
                        
                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }))
                                })
                                .catch(error => console.log(error))
                        })
                    }
                }
            })
        })
    }

    let getMedia = () => {
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
            {askForUsername === true ?
                <div className={styles.meetVideoContainer}>
                    <h2>Enter your lobby</h2>
                    <TextField id="outlined-basic" label="username" value={username} onChange={e => setUsername(e.target.value)}>
                        Success
                    </TextField>
                    <Button variant="contained" onClick={connect}>Connect</Button>
                    <div>
                        <video ref={localVideoRef} autoPlay muted></video>
                    </div>
                </div> : <>
                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>
                    <h2>My socket ID: {socketId}</h2>

                    {videos.map((video) => (
                        <div key={video.socketID}>
                            <h2>{video.socketID}</h2>

                            <video data-socket={video.socketID}
                                ref={ref => {
                                    if (ref && video.stream) {
                                        ref.srcObject = video.stream;
                                        ref.play().catch(e => console.error("Autoplay blocked by browser:", e));
                                    }
                                }}
                                autoPlay playsInline />
                        </div>
                    ))}
                </>
            }

            {/* {window.location.href} */}
        </div>
    )
}

export default VideoMeetComponent;
