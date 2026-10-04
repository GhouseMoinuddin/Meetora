import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const withAuth = (WrappedComponent) => {
    function WithAuthComponent(props) {
        const { userData } = useContext(AuthContext);
        const router = useNavigate();

        useEffect(() => {
            if (userData == undefined) {
                router("/")
            }
        }, [userData])
        return (
            <WrappedComponent />
        )
    }

    return WithAuthComponent
};

export default withAuth;