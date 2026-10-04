import React from "react";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { toast } from "react-toastify";

function History() {

    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);

    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (error) {
                return toast.error("something went wrong!");
            }
        }
        fetchHistory();
    }, [])

    if (meetings.length === 0) {
        return <div>No history</div>;
    }

    return (
        <div>History
            {meetings.map(e => {
                return (
                    <Card>
                        <CardContent>
                            <p>Meeting Code : {e.meeting_code}</p>
                            <p>Date : {e.date}</p>
                            <p>Time : {e.time}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

export default History; 