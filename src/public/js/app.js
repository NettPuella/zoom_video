
//JS는 event의 정보랑 같이 function을 호출함
//ws에서도 추가적인 정보를 받을 때 function이 존재함
//form.addEventListener("submit", fn);

const socket = new WebSocket(`ws://${window.location.host}`);

//connection 이 open 돠면 볼 수 있음
socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

//message를 받을때마다 내용을 출력하는 message
socket.addEventListener("message", (message) => {
    console.log("Just got this: ", message.data, " from the Server");
});

//서버가 오프라인 될 때 출력하는 close
socket.addEventListener("close", () => {
    console.log("Connected from Server ❌");
});