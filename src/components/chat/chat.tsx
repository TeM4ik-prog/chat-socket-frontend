import { useEffect, useRef, useState } from 'react';
import "./chat.css"
import { IChat, IMember, IMessage } from '../../App';
import { Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';

interface Props {
    socket: Socket,
    user: IMember,
    token: string
}

export default function Chat({ socket, user, token }: Props) {
    const [message, setMessage] = useState<string>()
    const [messages, setMessages] = useState<IMessage[]>([])
    const [chatData, setChatData] = useState<IChat | null>(null)

    const chatId: string | undefined = useParams().id


    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        socket.on('loadMessages', (data: IMessage[]) => {
            setMessages(data)
        });

        socket.on('checkData', (data: { chatData: IChat, userChats: IChat[] }) => {
            console.log(data)
            setChatData(data.chatData)
        });

        socket.on('message', (newMessage: IMessage[]) => {
            // console.log(newMessage)
            setMessages((prevMessages) => [...prevMessages, ...newMessage])

            // console.log(messages)
        })

        socket.emit('checkData', { chatId });
        socket.emit('loadMessages', { chatId });

        return () => {
            socket.off()
            // socket.disconnect()

        };

    }, [token, chatId])


    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages, chatId]);


    const handleSendMessage = () => {
        socket.emit('message', { message, chatId })
        setMessage('')
    }


    return (

        <div className='container-v'>
            {chatData ? (
                <div className="chat-container">

                    <div className='container-v'>

                        <div key={chatData.id} className='chat row'>
                            <img src={chatData.imageUrl}></img>
                            <h2 className="chat-header">{chatData.name}</h2>
                        </div>

                        <div>
                            {chatData?.members.map((member: IMember) => (
                                <div key={member.id} className='member'>
                                    <p>{member.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="messages-list" ref={chatRef}>
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

            ) : (<div>

                <h1>Chat not found</h1>

            </div>)}

        </div>
    )
}
