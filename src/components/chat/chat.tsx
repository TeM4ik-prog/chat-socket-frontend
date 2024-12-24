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

interface Chat {
    id: string
    name: string
    imageUrl: string
    createdAt: string
    members: Member[]
}

interface Member {
    id: string;
    banned: boolean;
    role: string
    about: string | null
    name: string
    createdAt: string
    updatedAt: string
}



// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkwNzBhN2Q3LWVhNTQtNGEzZS05NTJhLWUyMTA0YzlhY2JmNiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM1MDY0MjA5LCJleHAiOjE3MzUxNTA2MDl9.nnLOpiz3TkUMRDz-V6YODFa2ymC1IYBLy67Romu5b-A

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRiYzM3MGJlLTM3ODAtNGI5Yy1iMzQzLTYyMzk0ZGYwMjhkNyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM1MDczNDEyLCJleHAiOjE3MzUxNTk4MTJ9.mOPN5Qac6I2wCq4VlEYAnAlstj0ecPdTwRqR3eWpKro
export default function Chat() {
    const [message, setMessage] = useState<string>()
    const [messages, setMessages] = useState<Message[]>([])
    const [token, setToken] = useState<string>("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJkZWJiYTg0LWM0YzAtNDBkNS1iOGNmLWRkMzk0YzRkOTY3YiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM1MDcxMjAwLCJleHAiOjE3MzUxNTc2MDB9.waPa9jf53PxWJnrxPpZr3aj-hQi2_Yjc4CaFlLiOysY")
    const [tokenInput, setTokenInput] = useState<string>('')

    const [chatData, setChatData] = useState<Chat>()

    const [chats, setChats] = useState<Chat[]>([])


    const [createChatInput, setCreateChatInput] = useState<string>('')


    const [user, setUser] = useState<any>()


    

    let socket: Socket = io('ws://localhost:3001/chat', {
        auth: { token },
        reconnection: true,

    });

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        socket.on('checkData', (data: { chatData: Chat, userChats: Chat[] }) => {
            console.log(data)

            setChatData(data.chatData)

            setChats(data.userChats)

            return
        });

        socket.on('loadMessages', (data: Message[]) => {
            setMessages(data)
        });


        socket.on('message', (newMessage: Message[]) => {
            // console.log(newMessage)
            setMessages((prevMessages) => [...prevMessages, ...newMessage])

            // console.log(messages)
        })

        socket.on('error', (message) => {
            console.log('error:', message);
            alert(message)
        });



        socket.on('createChat', (newChat: Chat) => {
            console.log(newChat)
            setChats((prevChats) => [...prevChats, newChat])
        });

        socket.emit('checkData');
        socket.emit('loadMessages');

        getUserData()
        return () => {
            socket.off()
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
            auth: { token },
            reconnection: true,

        });
    }


    const findUserById = async () => {

        socket.emit('createChat', { recipientId: createChatInput})


    }

    return (
        <div>



            <div>
                <p className='token'>{token}</p>
                <input placeholder='token' onChange={(e) => setTokenInput(e.target.value)}></input>
                <button onClick={onChangeToken}>Submit</button>
            </div>

            <div>
                <input placeholder='find user' onChange={(e) => setCreateChatInput(e.target.value)}></input>

                <button onClick={findUserById}>Submit</button>
            </div>

            <div className='container-v'>
                <div className='chats-list'>
                    {chats?.map((ch: Chat) => (
                        <div key={ch.id} className='chat'>
                            <img src={ch.imageUrl}></img>
                            <p>{ch.name}</p>
                        </div> 
                    ))}
                </div>


                <div className="chat-container">

                    <div className='container-v'>

                        <div key={chatData?.id} className='chat'>
                            <img src={chatData?.imageUrl}></img>
                            <h2 className="chat-header">{chatData?.name}</h2>
                        </div>

                        <div>

                            {chatData?.members.map((member: Member) => (

                                <div key={member.id} className='member'>
                                    <p>{member.name}</p>
                                </div>
                            ))}



                        </div>




                    </div>





                    <div className="messages-list">
                        {messages.map((msg) => (
                            <div
                                key={Math.random()}
                                className={`message ${msg.userBaseId === user.id ? 'from-me' : 'from-other'}`}>
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

            </div>

        </div>
    )
}
