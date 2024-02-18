import Construction from "./Construction";

function Chat()
{
	return (
		<main className="MainContent">
			<h2>Chat</h2>
			<Construction />
		</main>
	);
}

export default Chat;

/*import { useEffect, useState, useRef } from "react";
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import "../styles/chat.css";

type MessagePayload = {
	content: string,
	sender_id: Number,
	channel_id: Number,
	date: Date
}

export const socket = io(`http://${location.hostname}:3450/chat`);

function Chat() {

	const [value, setValue] = useState('');

	const [messages, setMessages] = useState<MessagePayload[]>(() => {
		const data = localStorage.getItem("chat/id_here");

		if (data) {
			try { return (JSON.parse(data)); }
			catch (error) { return ([]); }
		}
		return ([]);
	});

	//Channels
	const [currentChannel, setCurrentChannel] = useState('');
	const [channels, setChannels] = useState<string[]>([]);

	//UsersList
	const [selectedUser, setSelectedUser] = useState('');
	//const [privmsg, setPrivmsg] = useState('');

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
			setCurrentChannel(channel);
			setChannels(prev => [...prev, channel]);
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
			channel: currentChannel
		});
		setValue('');
	}

	const createPrivChannel = (user: string) => {
		setChannels(prev => [...prev, user]);
	}

	const onPrivSubmit = () => {
		socket.emit('newMessage', {
			content: privmsg,
			channel: channel
		});
		setPrivmsg('');
	}

	const onClickJoinChannel = () => {
		socket.emit('joinChannel', 'general');
	}

	return (
		<main className="MainContent">
			<div>
				<h1>Chat testing</h1>
				{currentChannel.length === 0 ? <div>
					<button onClick={onClickJoinChannel}>Join channel 'general'</button>
				</div> : <div>
				<Tabs>
  					<TabList>
						<div>{
							channels.map((chan, index) =>
								<Tab key={index} onSelect={() => setCurrentChannel(chan)}>{chan}</Tab>
						)}</div>
 					</TabList>
					 <div>{
						channels.map((chan, index) =>
						<TabPanel key={index}>
    						<h3>Channel {chan}</h3>
							<div className="Messages">
							{messages.length === 0 ? <div>No Messages</div> : <div>{
								messages.map((msg, index) =>
									<div key={index}>
                						<b className="Messages__Sender" key={index}>{msg.sender_id.toString()}</b>
										<span className="Messages__Date">{format(new Date(msg.date), 'MMMM do yyyy, h:mm:ss a')}</span>
										<p className="Messages__Content">{msg.content}</p>
								</div>)
							}</div>}
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
						</TabPanel>
					)}</div>
				</Tabs>
				<h2>Connected Users</h2>
				<div>
					{users.length === 0 ? <div>No Online Users</div> : <div>
					{users.map((usr, index) => <div>
						<b className="UserList__name" key={index} onClick={() => setSelectedUser(usr)}>{usr}</b>
						{ usr === selectedUser ? 
							<div>
								<button>Invite</button>
								<button onClick={() => createPrivChannel(selectedUser)}>Message</button>
								<button>Block</button>
							</div> : <div></div>}
					</div>)}
					</div>}
				</div>
				</div>}
			</div>
		</main>
	);
}

export default Chat;*/

/*<span>Send private message : </span>
							<input
								type="text"
								value={privmsg}
								onChange={(e) => setPrivmsg(e.target.value)}
							/>
							<button onClick={onPrivSubmit}>Submit</button>*/