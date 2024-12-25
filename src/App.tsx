import { useEffect, useState } from 'react';
import './App.css'
import Chat from './components/chat/chat'

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ChatsPreview from './components/chatsPreview/chatsPreview';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';


export interface IChat {
  id: string
  name: string
  imageUrl: string
  createdAt: string
  members: Member[]
}

export interface IMessage {
  id: string,
  socketId: string,
  body: string,
  createdAt: string,
  updatedAt: string,
  userBaseId: string
}


export interface IMember {
  id: string;
  banned: boolean;
  role: string
  about: string | null
  name: string
  createdAt: string
  updatedAt: string
}

function App() {
  const [user, setUser] = useState<any>()
  const [token, setToken] = useState<string>("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJkZWJiYTg0LWM0YzAtNDBkNS1iOGNmLWRkMzk0YzRkOTY3YiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM1MDcxMjAwLCJleHAiOjE3MzUxNTc2MDB9.waPa9jf53PxWJnrxPpZr3aj-hQi2_Yjc4CaFlLiOysY")
  const [tokenInput, setTokenInput] = useState<string>('')
  const [createChatInput, setCreateChatInput] = useState<string>('')
  const [chats, setChats] = useState<IChat[]>([])



  let socket: Socket = io('ws://localhost:3001/chat', {
    auth: { token },
    transports: ["websocket"],
  });


  const getUserData = async () => {
    const response = await fetch('http://localhost:3001/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (data.statusCode == 401) {
      toast.error('unauthorized')
      socket.disconnect()
      return
    }

    setUser(data)
    console.log(data)
  }

  const onChangeToken = () => {
    setToken(tokenInput)
    // socket = io('ws://localhost:3001/chat', {
    //   auth: { token },
    // });
  }

  const findUserById = async () => {
    socket.emit('createChat', { recipientId: createChatInput })
  }

  useEffect(() => {
    socket.on('connect', () => {
      toast.success('Connected to WebSocket');
    });

    socket.on('checkData', (data: { chatData: IChat, userChats: IChat[] }) => {
      // console.log(data.userChats)

      setChats(data.userChats)

      return
    });


    socket.on('error', (message) => {
      console.log('error:', message);
      toast.error(message)
    });


    socket.on('createChat', (newChat: IChat) => {
      console.log(newChat)
      setChats((prevChats) => [...prevChats, newChat])
    });



    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
    });


    return () => {
      // socket.close();
      socket.off()

    };

  }, [])


  useEffect(() => {
    socket.emit('checkData');
    socket.emit('loadMessages');

    getUserData()

  }, [token])





  return (
    <>

      <div className='admin-block'>

        <div>
          <p className='token'>{token}</p>
          <input placeholder='token' onChange={(e) => setTokenInput(e.target.value)}></input>
          <button onClick={onChangeToken}>Submit</button>
        </div>


        <select onChange={(e) => setToken(e.target.value)}>
          <option defaultChecked value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJkZWJiYTg0LWM0YzAtNDBkNS1iOGNmLWRkMzk0YzRkOTY3YiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM1MDcxMjAwLCJleHAiOjE3MzUxNTc2MDB9.waPa9jf53PxWJnrxPpZr3aj-hQi2_Yjc4CaFlLiOysY">User1</option>
          <option value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRiYzM3MGJlLTM3ODAtNGI5Yy1iMzQzLTYyMzk0ZGYwMjhkNyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM1MDczNDEyLCJleHAiOjE3MzUxNTk4MTJ9.mOPN5Qac6I2wCq4VlEYAnAlstj0ecPdTwRqR3eWpKro">User2</option>
          <option value="3">3</option>
        </select>



        <div>
          <input placeholder='find user' onChange={(e) => setCreateChatInput(e.target.value)}></input>

          <button onClick={findUserById}>Submit</button>
        </div>
      </div>


      <div className='main'>

        <ChatsPreview chats={chats} />


        <Routes>
          <Route path="/" element={""} />
          <Route path="/chat/:id" element={<Chat socket={socket} user={user} token={token} />} />
        </Routes>

      </div>
    </>

  )
}

export default App
