import { io, Socket} from "socket.io-client"


export default function ConnectToServer(boardId: string){

    
    const socket = <Socket | null>io(`https://tasky-server-vczz.onrender.com`);
    
    
    function handleEvent(payload : any) {
        console.log(payload) 
    }

    if (socket) {
        socket.on('greet', handleEvent);
        socket.emit('addUser', boardId)

    }
   

    return socket
}