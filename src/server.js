//import WebSocket from "ws";
//import { Socket } from "dgram";
//import { type } from "os";
import http from "http";
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui";
import express from "express";

/* express에서 views를 설정 및 render해준다. 이후 나머지는 websocket에서 
실시간으로 일어난다. */
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

//웹소켓 서버 셋팅 
//1. Http 서버 셋팅
//const server = http.createServer(app);
//1-1. Http서버 위에 webSocket서버 셋팅
//const wss = new WebSocket.Server({ server });
//const sockets = [];

//2-1. Http 서버 셋팅
const httpServer = http.createServer(app);
//2-2. Http 서버 위에 SocketIO 서버 셋팅
//const wsServer = SocketIO(httpServer);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true    
    },
});
instrument(wsServer, {
    auth: false,
    mode: "development",
});

////////////////////// 1. WebSocket 사용하기 ///////////////////////////////////////
// function onSocketClose() {
//     console.log("Disconnected from the Browser ❌");
//     }
  
// function onSocketMessage(message) {
//     //console.log(message); > 버퍼로 표기되어 문자열로 표기되게 변경
//     //console.log(message.toString('utf-8'));
//     console.log(message.toString('utf-8'));
//     }


// wss.on("connection", (socket) => {

//     //fireFox, brave 연결시 socket에 넣어준다.
//     sockets.push(socket);

//     socket["nickname"] = "Anon";

//     //console.log(socket); 소켓 로그 확인용
//     console.log("Cannected to Browser ✅");

//     //Browser를 닫거나 컴퓨터가 잠자기 모드 상태일때 terminal에 표시됨
//     socket.on("close", onSocketClose);

//     //Browser가 Server에 메세지를 보냈을 때를 위한 listener 등록
//     socket.on("message", (msg) => {
//         //socket.send(message); utf-8로 변환해야 정상 작동함. 
//         //const messageString = message.toString('utf8');

//         const message = JSON.parse(msg);
//         switch (message.type) {
//             case "new_message":
//                 //aSocket는 각 브라우저를 aSocket으로 표시하고 메세지를 보냄
//                 //console.log(messageString);
//                 sockets.forEach((aSocket) =>
//                     aSocket.send(`${socket.nickname}: ${message.payload}`)
//               );
//               break; //break 누락 시 메세지로 작성한 닉네임으로 실시간으로 업데이트됨
//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 // 닉네임이 변경되었음을 알리기 위해 모든 소켓에 메시지를 보냄
//                 //기존 코드와 상이(추가됨) 이 코드가 없으면 변경된 코드가 저장 안됨
//                 sockets.forEach((aSocket) =>
//                 aSocket.send(`Server: ${socket.nickname}님이 닉네임을 변경했습니다.`)
//             );
//               break; //break 누락 시 메세지로 작성한 닉네임으로 실시간으로 업데이트됨
//           }
//     });
        
//     //console.log(parsed, messageString);
//     //Browser로 메세지를 보냄 
//     //socket.send("hello!");
// });
///////////////////////////////////////////////////////////////////////////////////


////////////////////// 2. SocketIO 사용하기 ///////////////////////////////////////  
function publicRooms(){
    const {
        sockets: {
            adapter: {sids, rooms},
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size
}

//BackEnd에서 Connect를 받을 준비함
wsServer.on("connection", (socket) => {
    // console.log(socket);
    socket["nickname"] = "익명";
    socket.onAny((event) => {
        console.log(wsServer.sockets.adapter);
        console.log(`Socket Event:${event}`);
    });
    //socket.on 뒤에 원하는 event를 넣어주면 된다. 이전 코드와 비교하면서 공부 필요!
    socket.on("enter_room", (roomName, done) => {
        //console.log(socket.id);
        //console.log(socket.rooms);
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
        //console.log(socket.rooms);
        // //10초 안에 FrontEnd에서 function을 실행시킴 
        // //서버는 BackEnd에서 function을 호출하지만 function은 FrontEnd에서 실행됨
        // socket.on("enter_room", (msg, done) => {
        // setTimeout(() => {
        //     done();
        // }, 10000);
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => 
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
        );
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    }); 
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

httpServer.listen(3000, handleListen);


{
    type:"message";
    payload:"hello everyone!";
}
{
    type:"nickname";
    payload:"hey";
}
