import React from "react";
import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import Styles from "../styles/home.module.css";

function HomeComponent() {

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState();

    let handleJoinVideoCall = async () => {
        navigate(`/${meetingCode}`);
    }
    return (
        <div>
            <>
                <div className="navBar">
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <h3>Meetora</h3>
                    </div>
                </div>
            </>
        </div>
    )
}

export default withAuth(HomeComponent);