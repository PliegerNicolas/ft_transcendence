import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';

type MessagePayload = {
	content: string;
	msg: string;
}

export const socket = io('http://localhost:3450/chat')
export const WebsocketContext = createContext<Socket>(socket);

export const WebsocketProvider = WebsocketContext.Provider;

function Chat() {

	const [value, setValue] = useState('');
	const [messages, setMessages] = useState<MessagePayload[]>([]);
	const socketObj = useContext(WebsocketContext);

	useEffect(() => {
		socketObj.on('connect', () => {
			console.log('Connected');
		});
		socketObj.on('onMessage', (newMessage: MessagePayload) => {
			console.log('onMessage event received');
			console.log(newMessage);
			setMessages((prev) => [...prev, newMessage])
		});

		return () => {
			socketObj.off('connect');
			socketObj.off('onMessage');
			console.log('Unregistering Events');
		}
	}, []);

	const onSubmit = () => {
		socketObj.emit('newMessage', value);
		setValue('');
	}

	return (
		<main className="MainContent">
			<WebsocketProvider value={socket}></WebsocketProvider>
			<div>
				<h1>Chat testing</h1>
				<div>
					{messages.length === 0 ? <div>No Messages</div> : <div>
					{messages.map((msg) => <div>
						<p>{msg.content}</p>
					</div>)}
					</div>}
				</div>
				<div>
					<input
						type="text"
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
					<button onClick={onSubmit}>Submit</button>
				</div>
			</div>
		</main>
	);
}

export default Chat;