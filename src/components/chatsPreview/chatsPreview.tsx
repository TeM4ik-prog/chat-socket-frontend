import { IChat } from "../../App";
import { Link } from "react-router-dom";
import "./chatsPreview.css"


interface Props {
    chats: IChat[]
    // socket: Socket;
}


export default function ChatsPreview({ chats }: Props) {

    if (!chats || chats.length === 0) {
        return <div>No chats available</div>;
    }

    return (

        <div className='chats-list'>
            {chats?.map((ch: IChat) => (
                <div key={ch.id} className='chat'>
                  <Link to={ch.id ? `/chat/${ch.id}` : '#'}>
                        <img src={ch.imageUrl}></img>
                        <p>{ch.name}</p>
                    </Link>
                </div>
            ))}
        </div>
    )
}