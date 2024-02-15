import http from "http";
import WebSocket from "ws";
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
const server = http.createServer(app);
//2. Http서버 위에 webSocket서버 셋팅
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
    //console.log(socket); 소켓 로그 확인용
    console.log("Cannected to Browser ✅");
    //메세지를 보냄 
    socket.send("hello!");
});

server.listen(3000, handleListen);
