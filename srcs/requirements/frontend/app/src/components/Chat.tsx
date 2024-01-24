import { useEffect, useState, useRef } from "react";
import { io } from 'socket.io-client';
import { format } from 'date-fns';

type MessagePayload = {
	content: string,
	sender_id: Number,
	channel_id: Number,
	date: Date
}

export const socket = io(`http://${location.hostname}:3450/chat`);

function Chat() {

	const [value, setValue] = useState('');
	const [channel, setChannel] = useState('');
	const [openMenu, setOpenMenu] = useState(false);

	const [messages, setMessages] = useState<MessagePayload[]>(() => {
		const data = localStorage.getItem("chat/id_here");

		if (data) {
			try { return (JSON.parse(data)); }
			catch (error) { return ([]); }
		}
		return ([]);
	});

	const UserMenu = () => {
		return (
			<div>
				<ul>
					<span>Send private message : </span>
					<input
						type="text"
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
					<button onClick={onSubmit}>Submit</button>
				</ul>
			</div>
		)
	}

	const msgRef = useRef<MessagePayload[]>();
	msgRef.current = messages;

	const [users, setUsers] = useState<string[]>([]);

	useEffect(() => {
		socket.on('connect', () => {
			console.log('Connected');
		});
		socket.on('userJoinedChannel', (newUserId: string) => {
			console.log('New user connected:', newUserId);
			setUsers((prev) => [...prev, newUserId]);
		});
		socket.on('userDisconnected', (disconnectedUserId: string) => {
    		console.log('User disconnected:', disconnectedUserId);
    		setUsers((prev) => prev.filter(userId => userId !== disconnectedUserId));
		});

		socket.on('onMessage', (newMessage: MessagePayload) => {
			console.log('onMessage event received');
			console.log(newMessage);
			setMessages(prev => [...prev, newMessage]);
		});

		socket.on('joinedChannel', (channel: string) => {
			console.log('Channel joined');
			setChannel(channel);
		});

		return () => {
			socket.off('connect');
			socket.off('userJoinedChannel');
			socket.off('userDisconnected');
			socket.off('onMessage');
			socket.off('joinedChannel');
			localStorage.setItem("chat/id_here", JSON.stringify(msgRef.current));
			console.log('Unregistering Events');
		}
	}, []);

	const onSubmit = () => {
		socket.emit('newMessage', {
			content: value,
			channel: channel
		});
		setValue('');
	}

	const onClickJoinChannel = () => {
		socket.emit('joinChannel', 'general');
	}

	return (
		<main className="MainContent">
			<div>
				<h1>Chat testing</h1>
				{channel.length === 0 ? <div>
					<button onClick={onClickJoinChannel}>Join channel 'general'</button>
				</div> : 
				<div>
				<h3>Channel {channel} :</h3>
				<div>
					{messages.length === 0 ? <div>No Messages</div> : <div> {
						messages.map((msg, index) =>
							<div key={index}>
                				<b key={index}>{msg.sender_id.toString()}</b>
								<span>{format(new Date(msg.date), 'MMMM do yyyy, h:mm:ss a')}</span>
								<p>{msg.content}</p>
							</div>)
					} </div>}
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
				<h2>Connected Users</h2>
				<div>
					{users.length === 0 ? <div>No Online Users</div> : <div>
					{users.map((usr, index) => <div>
						<b key={index} onClick={() => setOpenMenu((prev) => !prev)}>{usr} {openMenu && <UserMenu />}</b>
					</div>)}
					</div>}
				</div>
				</div>}
			</div>
		</main>
	);
}

export default Chat;