import { useState, useRef, useEffect } from "react";

import closeLeft from "../assets/close-left.svg";
import openLeft from "../assets/open-left.svg";
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
			name: "julboyer, PliegerNicolas, Jonatesp, mayeul",
			size: 4
		},
		{
			id: 3,
			name: "PliegerNicolas",
			size: 2
		},
		{
			id: 4,
			name: "Jonatesp",
			size: 2
		},
		{
			id: 5,
			name: "La meilleure convo",
			size: 42
		},
		{
			id: 6,
			name: " julboyer",
			size: 2
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

	const [showChanList, setShowChanList] = useState(1);

	const [currentChanId, setCurrentChanId] = useState(1);

	const currentChan = dummyChanList
		.filter(item => item.id === currentChanId)[0];

	/*
	** These lines are desirable to auto-scroll at bottom of chat.
	*/
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => ref.current?.scrollIntoView({behavior: "smooth"}), []);

	return (
		<main className="MainContent Chat">
		{
			showChanList ?
			<div className={
				"Chat__Channels"
				+ (showChanList === -1 ? " collapse" : "")
				+ (showChanList === 2 ? " expand" : "")
			}>
				<h3 className="Chat__ChannelsTitle">
					Your channels
					<div
						className="Chat__Collapse"
						onClick={() => {
							setShowChanList(-1);
							setTimeout(() => {setShowChanList(0)}, 200);
					}}>
						<img src={closeLeft} />
					</div>
				</h3>
				<div className="Chat__ChannelList">
				{
					dummyChanList.map(item =>
						<div
							key={item.id}
							className={`Chat__ChannelListItem${item.id === currentChanId ? "--curr" : ""}`}
							onClick={() => {setCurrentChanId(item.id)}}
						>
							<div className="Chat__ChannelListItemName">{item.name}</div>
							{
								item.size > 2 &&
								<div className="Chat__ChannelListItemSize">
									{item.size + " members"}
								</div>
							}
						</div>
					)
				}
				</div>
			</div> : ""
		}
			<div className="Chat__Content">
				<div className="Chat__Header">
				{
					showChanList < 1 ?
					<div className="Chat__Collapse Chat__Expand" onClick={() => {
						setShowChanList(2);
						setTimeout(() => {setShowChanList(1)}, 200);
					}}>
						<img src={openLeft} />
					</div> : ""
				}
					<div className="Chat__Title">
						{currentChan.name}
					</div>
				</div>
				<div className="Chat__Convo">
				{
					dummyMsgList.map((item, index) => 
						<div key={index} className={`Msg${item.uid === 1 ? "--me" : ""}`}>
							<div
								className="Msg__Sender"
								style={{color: `hsl(${(360 / currentChan.size) * item.uid} 80% 80%)`}}
							>
								{item.username}
							</div>
							{item.content}
						</div>
					)
				}
				<div ref={ref} />
				</div>
				<div className="Chat__Input">
					<textarea
						placeholder={`Send a message to « ${currentChan.name} »`}
					/>
				</div>
			</div>
		</main>
	);
}

export default ChatTest;