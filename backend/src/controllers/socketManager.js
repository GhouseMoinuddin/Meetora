import { Server } from "socket.io";

const ConnecttoSocket = (server) => {
    const io = new Server(server);

    return io;
}

export default ConnecttoSocket;