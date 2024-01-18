import { useEffect, useState } from "react";
import { io } from 'socket.io-client';
import { format } from 'date-fns';

type MessagePayload = {
	content: string,
	sender_id: Number,
	channel_id: Number,
	date: Date
}

export const socket = io('http://localhost:3450/chat')

function Chat() {

	const [value, setValue] = useState('');
	const [messages, setMessages] = useState<MessagePayload[]>([]);

	useEffect(() => {
		socket.on('connect', () => {
			console.log('Connected');
		});
		socket.on('onMessage', (newMessage: MessagePayload) => {
			console.log('onMessage event received');
			console.log(newMessage);
			setMessages((prev) => [...prev, newMessage])
		});

		return () => {
			socket.off('connect');
			socket.off('onMessage');
			console.log('Unregistering Events');
		}
	}, []);

	const onSubmit = () => {
		socket.emit('newMessage', value);
		setValue('');
	}

	return (
		<main className="MainContent">
			<div>
				<h1>Chat testing</h1>
				<div>
					{messages.length === 0 ? <div>No Messages</div> : <div>
					{messages.map((msg, index) => <div>
						<b key={index}>{msg.sender_id.toString()}</b>
						<span key={index}>{format(msg.date, 'MMMM do yyyy, h:mm:ss a')}</span>
						<p key={index}>{msg.content}</p>
					</div>)}
					</div>}
				</div>
				<div>
					<span>Send message : </span>
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