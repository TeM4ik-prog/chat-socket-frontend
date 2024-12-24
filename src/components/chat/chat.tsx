import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import "./chat.css"






interface Message {
    id: string,
    socketId: string,
    body: string,
    createdAt: string,
    updatedAt: string,
    userBaseId: string
}


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkwNzBhN2Q3LWVhNTQtNGEzZS05NTJhLWUyMTA0YzlhY2JmNiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM1MDY0MjA5LCJleHAiOjE3MzUxNTA2MDl9.nnLOpiz3TkUMRDz-V6YODFa2ymC1IYBLy67Romu5b-A

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBkZTk2ZWM1LTc5NTYtNGFmNi05OGMwLTJjNDRkMmRiZTk0OCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM1MDYzMTAzLCJleHAiOjE3MzUxNDk1MDN9.Z5vB3SScZIolnxDV0V-8HYsf5x0NJE5fHxQpCAKXOsc
export default function Chat() {
    const [message, setMessage] = useState<string>()
    const [messages, setMessages] = useState<Message[]>([])
    const [token, setToken] = useState<string>("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNmZjU0YTY4LWJlZGMtNDY0NS1iZGQ3LTdmMmQyYWI1NTQzMSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM1MDU4Mjc5LCJleHAiOjE3MzUxNDQ2Nzl9.A47i37WNwpP1P8gSLN0Brxc5BCWsTPzuslQmDnRpXoY")
    const [tokenInput, setTokenInput] = useState<string>('')


    const [user, setUser] = useState<any>()

    let socket: Socket = io('ws://localhost:3001/chat', {
        auth: { token }
    });

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        socket.on('checkData', () => {
            console.log('checked');
            return
        });



        socket.on('loadMessages', (data: Message[]) => {
            console.log(data)
            setMessages(data)
        });



        socket.on('message', (newMessage: Message[]) => {
            console.log(newMessage)
            setMessages((prevMessages) => [...prevMessages, ...newMessage])

            console.log(messages)
        })

        socket.on('unauthorized', (message) => {
            console.log('Authorization error:', message);
            alert(message)
        });




        socket.emit('checkData');
        socket.emit('loadMessages');


        getUserData()
        return () => {
            // socket.disconnect();
            socket.off('message')
        };
    }, [token])

    const getUserData = async () => {
        const response = await fetch('http://localhost:3001/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await response.json()

        console.log(data)
        setUser(data)

    }


    const handleSendMessage = () => {
        socket.emit('message', { message })
        // setMessage('')
    }

    const onChangeToken = () => {
        setToken(tokenInput)
        socket = io('ws://localhost:3001/chat', {
            auth: { token }

        });
    }

    return (
        <>

            <div>
                <p className='token'>{token}</p>
                <input placeholder='token' onChange={(e) => setTokenInput(e.target.value)}></input>
                <button onClick={onChangeToken}>Submit</button>
            </div>

            <div className="chat-container">
                <h2 className="chat-header">Chat</h2>

                <div className="messages-list">
                    {messages.map((msg) => (
                        <div
                            key={Math.random()}
                            className={`message ${msg.userBaseId === user.id ? 'from-me' : 'from-other'}`}
                        >
                            <div className="message-header">
                                <span className="message-time">
                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="message-body">
                                {msg.body}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="message-input">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your message"
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            </div>

        </>
    )
}
