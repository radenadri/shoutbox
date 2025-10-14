import { useEffect, useRef, useState } from "react";
import axios from "axios";

import { API_URL } from "../config";

export default function Shoutbox() {
    // Reference to the end of the messages list
    const messageEndsRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState(
        localStorage.getItem("username") || ""
    );
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState([]);

    // Fetch messages on component mount`
    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        localStorage.setItem("username", username);
    }, [username]);

    // Refresh every 5 seconds (simulating real time)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMessages();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        const {
            data: { data },
        } = await axios.get(`${API_URL}/messages`);

        setMessages(data);
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        try {
            const {
                data: { data },
            } = await axios.post(`${API_URL}/messages`, {
                username,
                content,
            });

            setContent("");
            setMessages([...messages, data]);

            // scroll to bottom
            setTimeout(() => {
                messageEndsRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (error) {
            setErrors(error.response.data.errors);
        }
    };

    const isDisabled = !username || !content;

    return (
        <div className="max-w-lg mx-auto mt-10 p-4 border rounded">
            <h1 className="text-xl font-bold mb-4 text-center">💬 Shoutbox</h1>
            <div className="h-64 overflow-y-auto border p-2 mb-4 bg-slate-50 rounded">
                {messages.map((msg) => (
                    <div key={msg.id} className="mb-2 flex flex-col gap-">
                        <strong>{msg.username}</strong>
                        <div>{msg.content}</div>
                        <span className="text-xs text-slate-400">
                            {new Date(msg.created_at)
                                .toLocaleTimeString("en-US", {
                                    hour12: false,
                                })
                                .slice(0, 5)}
                        </span>
                    </div>
                ))}
                <div ref={messageEndsRef} />
            </div>

            <form onSubmit={sendMessage} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border p-2 flex-1 rounded"
                />
                {errors.username && (
                    <div className="text-red-500">{errors.username}</div>
                )}
                <textarea
                    value={content}
                    rows={3}
                    placeholder="Wow, this is amazing..."
                    onChange={(e) => setContent(e.target.value)}
                    className="border p-2 flex-1 rounded"
                />
                {errors.content && (
                    <div className="text-red-500">{errors.content}</div>
                )}
                <button
                    type="submit"
                    disabled={isDisabled}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
