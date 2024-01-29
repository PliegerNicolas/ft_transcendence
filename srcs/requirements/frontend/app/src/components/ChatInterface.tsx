import { useState } from "react";

import "../styles/chat.css";

function ChatTest()
{
	const dummyChanList = [
		{
			id: 1,
			name: "Un channel",
			size: 7
		},
		{
			id: 2,
			name: "julboyer, PliegerNicolas, Jonatesp",
			size: 3
		},
		{
			id: 3,
			name: "PliegerNicolas",
			size: 1
		},
		{
			id: 4,
			name: "Jonatesp",
			size: 1
		},
		{
			id: 5,
			name: "La meilleure convo",
			size: 42
		},
		{
			id: 6,
			name: " julboyer",
			size: 1
		}
	];

	const dummyMsgList = [
		{
			uid: 1,
			username: "mama",
			content: "Coucou, ceci est un test de message dans le chat",
			date: "18:04"
		},
		{
			uid: 2,
			username: "Momo",
			content: "Oui, effectiovement, bien le coucou mdrrrr",
			date: "18:05"
		},
		{
			uid: 1,
			username: "mama",
			content: "Et bien du coup ça a l'air de marcher",
			date: "18:04"
		},
		{
			uid: 3,
			username: "Mimi",
			content: `sdssfqsdfsdfqsdfqf
			sqfqdfkljdsgldfkgldfkgn
			dfgdffffffffffffff
			
			dfgsdfgsfdgdsfg`,
			date: "18:04"
		},
		{
			uid: 1,
			username: "mama",
			content: "Tu racontes de la merde @Mimi",
			date: "18:06"
		},
		{
			uid: 1,
			username: "mama",
			content: "Et il faut pas.",
			date: "18:06"
		},
		{
			uid: 3,
			username: "Mimi",
			content: "Ah bon d'accord",
			date: "18:07"
		},
	]

	const [currentChan, setCurrentChan] = useState(1);

	const currentChanName = dummyChanList
		.filter(item => item.id === currentChan)[0].name;

	return (
		<main className="MainContent Chat">
			<div className="Chat__Channels">
				<h3 className="Chat__ChannelsTitle">
					Your channels:
				</h3>
				<div className="Chat__ChannelList">
				{
					dummyChanList.map(item =>
						<div
							key={item.id}
							className={`Chat__ChannelListItem${item.id === currentChan ? "--curr" : ""}`}
							onClick={() => {setCurrentChan(item.id)}}
						>
							<div className="Chat__ChannelListItemName">{item.name}</div>
							{
								item.size != 1 &&
								<div className="Chat__ChannelListItemSize">
									{item.size + " members"}
								</div>
							}
						</div>
					)
				}
				</div>
			</div>
			<div className="Chat__Content">
				<div className="Chat__Header">
					{currentChanName}
				</div>
				<div className="Chat__MsgList">
				{
					dummyMsgList.map((item, index) => 
						<div key={index} className="Msg">
							<div className="Msg__Sender">
								{item.username}
							</div>
							{item.content}
						</div>
					)
				}
				</div>
			</div>
		</main>
	);
}

export default ChatTest;