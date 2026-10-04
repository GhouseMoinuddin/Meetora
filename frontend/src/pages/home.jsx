import React from "react";
import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import "../App.css";
import IconButton from "@mui/material/IconButton";
import RestoreIcon from "@mui/icons-material/Restore";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Button from "@mui/material/Button";

function HomeComponent() {

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState();

    const { addToUserHistory } = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    }
    return (
        <div>
            <>
                <div className="navBar">
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <h2>Meetora</h2>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={
                            () => {
                                navigate("/history");
                            }
                        }>
                            <RestoreIcon />
                        </IconButton>
                        <p>History</p>
                        <Button onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}>Logout
                        </Button>
                    </div>
                </div>

                <div className="meetContainer">
                    <div className="leftPanel">
                        <h2>Providing Quality Video Conferencing for your needs...</h2>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined" label="Enter Meeting Code" variant="outlined" />
                            <Button onClick={handleJoinVideoCall} variant="">Join</Button>
                        </div>
                    </div>

                    <div className="rightPanel">
                        <img src="./logo3.svg" alt="random_image" />
                    </div>

                </div>
            </>
        </div>
    )
}

export default withAuth(HomeComponent);