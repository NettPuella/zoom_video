
////////////////////// 1. WebSocket 사용하기 ///////////////////////////////////////

// //JS는 event의 정보랑 같이 function을 호출함
// //ws에서도 추가적인 정보를 받을 때 function이 존재함
// //form.addEventListener("submit", fn);

// const messageList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick");
// const messageForm = document.querySelector("#message");
// //Browser에서 BackEnd에 연결
// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMassage(type, payload){
//     const msg = { type, payload };
//     return JSON.stringify(msg);
// }

// function handleOpen() {
//     console.log("Connected to Server ✅");
// }

// //connection 이 open 되면 볼 수 있는 listener 등록
// // socket.addEventListener("open", () => {
// //     console.log("Connected to Server ✅");
// // });
// socket.addEventListener("open", handleOpen);

// //message를 받을때마다 내용을 출력하는 message listener 등록
// socket.addEventListener("message", (message) => {
//     //FrontEnd에서 BackEnd로 메세지 보내기
//     //console.log("New message: ", message.data);
    
//     // 하단의 코드를 handleSubmit에 붙여넣음
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);
// });

// //서버가 오프라인 될 때 출력하는 close listener 등록
// socket.addEventListener("close", () => {
//     console.log("Disconnected from Server ❌");
// });

// //메세지를 보내기까지 10초 로딩 
// // setTimeout(() => {
// //     //FrontEnd에서 BackEnd로 메세지를 보냄
// //     socket.send("hello from the browser!");
// // }, 10000);

// function handleSubmit(event){
//     event.preventDefault();
//     const input = messageForm.querySelector("input");
//     //메세지 입력 후 enter -> 칸을 비워준 뒤 BackEnd로 메세지를 보냄
//     socket.send(makeMassage("new_message", input.value));
//     const li = document.createElement("li");
//     li.innerText = `You: ${input.value}`;
//     messageList.append(li);
//     input.value = "";
// }

// //닉네임을 변경하고 싶을 때 BackEnd로 보냄
// function handleNickSubmit(event){
//     event.preventDefault();
//     const input = nickForm.querySelector("input");
//     socket.send(makeMassage("nickname", input.value));
//     input.value = "";
// }

// messageForm.addEventListener("submit", handleSubmit);
// nickForm.addEventListener("submit", handleNickSubmit);



////////////////////// 2. SocketIO 사용하기 ///////////////////////////////////////
//socketIO를 FrontEnd와 연결할 수 있다.
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}    

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");   
    const value = input.value; 
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");   
    const value = input.value;
    socket.emit("nickname", input.value);
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);   
    nameForm.addEventListener("submit", handleNicknameSubmit);   
}
   
function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    //1. 특정한 event를 emit해 줄 수 있음, 어떤 이름이든 상관 없음
    //2. object를 전송할 수 있음
    //3. app.js(socket.emit)의 이름과 server.js(socket.on)의 이름이 동일해야 함 "enter_room(개발자 지정)"
    //4. emit의 마지막 argument가 function이면 "done"을 실행시킬 수 있음 (순서: 이벤트 이름-> 중간 상관 없음 -> 마지막이 꼭 function이여야 함 )
    socket.emit(
    "enter_room", 
    input.value,
    showRoom
    );
    roomName = input.value;
    input.value = ""
}

form.addEventListener("submit", handleRoomSubmit);


socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} left ㅠㅠ`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0){
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});