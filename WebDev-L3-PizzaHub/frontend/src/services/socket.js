// import { io } from "socket.io-client";

// const SOCKET_URL =
//   import.meta.env.VITE_BASE_URL ;

// const socket = io(SOCKET_URL, {
//   autoConnect: true,
//   transports: ["websocket", "polling"],
// });

// export default socket;

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;