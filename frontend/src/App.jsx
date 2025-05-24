import { useEffect, useState } from "react";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import './index.css'
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Users,
  LogOut,
  TerminalSquare,
  Menu,
  X
} from "lucide-react";

const socket = io(`${import.meta.env.VITE_SERVER_URL}`);

const backgroundAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const floatingItems = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [outPut, setOutPut] = useState("");
  const [version, setVersion] = useState("*");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    socket.on("userJoined", (users) => setUsers(users));
    socket.on("codeUpdate", (newCode) => setCode(newCode));
    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}... is Typing`);
      setTimeout(() => setTyping(""), 2000);
    });
    socket.on("languageUpdate", (newLanguage) => setLanguage(newLanguage));
    socket.on("codeResponse", (response) => setOutPut(response.run.output));
    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => socket.emit("leaveRoom");
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// start code here");
    setLanguage("javascript");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const runCode = () => {
    socket.emit("compileCode", { code, roomId, language, version });
  };

  if (!joined) {
    return (
      <motion.div
        className="relative flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 overflow-hidden"
        variants={backgroundAnimation}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={floatingItems}
          className="absolute top-10 left-10 w-32 h-32 bg-indigo-400 rounded-full mix-blend-overlay blur-3xl animate-pulse opacity-30"
        ></motion.div>
        <motion.div
          variants={floatingItems}
          className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-overlay blur-3xl animate-pulse opacity-30"
        ></motion.div>
        <motion.div
          variants={floatingItems}
          className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 text-center space-y-4 border border-white/10"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Code2 className="h-8 w-8 text-indigo-300 animate-bounce" />
            <h1 className="text-3xl font-bold text-white tracking-wide">CodeRoom</h1>
          </div>
          <p className="text-gray-200">Join a collaborative coding session</p>
          <input
            type="text"
            placeholder="Room Id"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full p-3 bg-white/20 border border-gray-300 rounded-md text-base text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-3 bg-white/20 border border-gray-300 rounded-md text-base text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={joinRoom}
            className="w-full p-3 bg-indigo-600 text-white rounded-md text-base hover:bg-indigo-700 transition"
          >
            Join Room
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <button
        className="absolute top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-md md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed md:relative z-40 w-64 bg-gray-900 text-white p-6 flex flex-col space-y-6 shadow-xl"
          >
            <div className="flex items-center justify-center space-x-2">
              <Code2 className="h-6 w-6 text-indigo-400" />
              <h2 className="text-xl font-bold">CodeRoom</h2>
            </div>
            <div className="text-center">
              <h3 className="text-base font-medium mb-2">Room: {roomId}</h3>
              <button
                onClick={copyRoomId}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Copy Id
              </button>
              {copySuccess && <span className="ml-2 text-green-400 text-sm">{copySuccess}</span>}
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Users:</span>
              </h4>
              <ul className="space-y-1">
                {users.map((user, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-700 rounded px-2 py-1 text-sm"
                  >
                    {user.slice(0, 8)}...
                  </motion.li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-indigo-300">{typing}</p>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="p-2 bg-gray-800 rounded text-white w-full focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            <button
              onClick={leaveRoom}
              className="flex items-center justify-center space-x-2 bg-red-600 w-full text-white py-2 rounded hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" /> <span>Leave Room</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 p-4 flex flex-col overflow-auto bg-gradient-to-br from-[#101828] to-purple-900">
        <div className="flex-1 rounded-lg overflow-hidden border shadow-md">
          <Editor
            height="100%"
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>
        <button
          onClick={runCode}
          className="mt-4 flex items-center justify-center space-x-2 bg-green-500 px-4 py-2 text-white rounded hover:bg-green-600 w-fit"
        >
          <TerminalSquare className="h-4 w-4" /> <span>Execute</span>
        </button>
        <textarea
          readOnly
          className="w-full mt-3 p-3 text-base h-48 border rounded resize-none bg-gradient-to-r from-gray-100 to-slate-200 shadow-inner"
          value={outPut}
          placeholder="Output will appear here ..."
        />
      </div>
    </div>
  );
};

export default App;
