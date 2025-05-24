# CodeRoom

CodeRoom is a collaborative real-time code editor that allows multiple users to join a room, write code together, and execute it in various languages. It uses a React frontend with Monaco Editor and a Node.js backend with Socket.IO for real-time communication.

---

## Features

- **Real-time collaborative code editing**
- **Room-based user sessions**
- **Live user list and typing indicators**
- **Language selection (JavaScript, Python, Java, C++)**
- **Remote code execution and output sharing**
- **Copyable room IDs for easy sharing**

---

## How It Works

### 1. User Flow

1. User enters a Room ID and Name.
2. User joins the room via socket event.
3. Users in the same room see each other, can collaboratively edit code, and execute it.
4. Output is shown to all users in the room.

---

## Backend: Socket Events

The backend (`backend/index.js`) manages real-time events using Socket.IO.

### `join`

**Purpose:** User joins a room.

```javascript
socket.on("join", ({ roomId, userName }) => {
  // Add user to room and notify others
});
```

- Adds the user to the specified room.
- Notifies all users in the room of the updated user list.

---

### `codeChange`

**Purpose:** Broadcast code changes to other users in the room.

```javascript
socket.on("codeChange", ({ roomId, code }) => {
  socket.to(roomId).emit("codeUpdate", code);
});
```

- When a user edits code, the change is sent to all other users in the room.

---

### `leaveRoom`

**Purpose:** User leaves the room.

```javascript
socket.on("leaveRoom", () => {
  // Remove user from room and update user list
});
```

- Removes the user from the room and updates the user list for others.

---

### `typing`

**Purpose:** Notify others when a user is typing.

```javascript
socket.on("typing", ({ roomId, userName }) => {
  socket.to(roomId).emit("userTyping", userName);
});
```

- Sends a typing notification to other users in the room.

---

### `languageChange`

**Purpose:** Change the programming language for the room.

```javascript
socket.on("languageChange", ({ roomId, language }) => {
  io.to(roomId).emit("languageUpdate", language);
});
```

- Updates the language for all users in the room.

---

### `compileCode`

**Purpose:** Execute code and return the output.

```javascript
socket.on("compileCode", async ({ code, roomId, language, version }) => {
  // Send code to Piston API and broadcast output
});
```

- Sends code to the [Piston API](https://github.com/engineer-man/piston) for execution.
- Broadcasts the output to all users in the room.

---

### `disconnect`

**Purpose:** Handle user disconnection.

```javascript
socket.on("disconnect", () => {
  // Remove user from room and update user list
});
```

- Removes the user from the room and updates the user list.

---

## Frontend: Socket Usage

The frontend (`frontend/src/App.jsx`) connects to the backend and listens/emits the above events.

**Example: Listening for code updates**

```jsx
useEffect(() => {
  socket.on("codeUpdate", (newCode) => setCode(newCode));
  // ...other events...
  return () => {
    socket.off("codeUpdate");
    // ...other events...
  };
}, []);
```

**Example: Emitting code changes**

```jsx
const handleCodeChange = (newCode) => {
  setCode(newCode);
  socket.emit("codeChange", { roomId, code: newCode });
  socket.emit("typing", { roomId, userName });
};
```

---

## Additional Backend Features

- **Keep-Alive Ping:**  
  The backend pings a URL every 30 seconds to keep the frontend awake (useful for free hosting):

  ```javascript
  const url = process.env.URL;
  const interval = 30000;

  function reloadWebsite() {
    if (!url) return;
    axios
      .get(url)
      .then(() => {
        console.log("website reloaded");
      })
      .catch((error) => {
        console.error(`Error : ${error.message}`);
      });
  }

  setInterval(reloadWebsite, interval);
  ```

---

## Running the Project

1. **Backend:**  
   ```sh
   npm install
   npm run dev
   ```
2. **Frontend:**  
   ```sh
   cd frontend
   npm install
   npm run dev
   ```

---

## Environment Variables

- `PORT`: Backend server port.
- `URL`: Frontend URL for keep-alive.
- `CORS_URL`: Allowed CORS origin for Socket.IO.

---

## Project Structure

```
Code_editor/
├── backend/
│   └── index.js
├── frontend/
│   └── src/
│       └── App.jsx
└── README.md
```

---

## License

MIT

---
