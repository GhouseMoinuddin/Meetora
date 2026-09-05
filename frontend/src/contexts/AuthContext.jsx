import axios, { HttpStatusCode } from 'axios';
import {createContext} from "react";
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext({}); 

const client = axios.create({
    baseURL : "localhost:8000/api/v1/users"
})

export const AuthProvider = ({children})=> {
    const authContext = useContext(AuthContext);
    const [userData, setUserData] = useState(authContext);
    const handleRegister = async (name,username, password)=> {
        try {
            let request = await client.post("/register", {
                name:name,
                username:username,
                password:password
            })

            if(request.status == HttpStatus.CREATED) {
                return request.data.message;
            }
        } catch (error) {
            throw error;   
        }
    }
    const router = useNavigate();
    const data = {
        userData, setUserData,handleRegister
    }
    return(
        <AuthContext.provider value = {data}>
            {children}
        </AuthContext.provider>
    )
}