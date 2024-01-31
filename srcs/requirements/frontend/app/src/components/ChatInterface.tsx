import { useState, useRef, useEffect } from "react";

import { MsgType } from "../utils/types";

import closeLeft from "../assets/close-left.svg";
import openLeft from "../assets/open-left.svg";
import defaultPicture from "../assets/default_profile.png";

import "../styles/chat.css";

// <Chat /> ====================================================================

export default function ChatTest()
{
	const chanList = [
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

	const [msgList, setMsgList] = useState([
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
			uid: 3,
			username: "Mimi",
			content: `ertryurtyutyutyrrte`,
			date: "18:04"
		},
		{
			uid: 3,
			username: "Mimi",
			content: `wncbwxcnbvxc,nwb<v`,
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
			uid: 2,
			username: "Momo",
			content: "Oui, c'est pas bieeeen",
			date: "18:07"
		},
		{
			uid: 3,
			username: "Mimi",
			content: "Ah bon d'accord",
			date: "18:07"
		},
		{
			uid: 3,
			username: "Mimi",
			content: `Ce message ne se connecte pas avec le précédent parce que la
			date est différente`,
			date: "18:08"
		},
	]);

	const [showChanList, setShowChanList] = useState(1);
	const [currentChanId, setCurrentChanId] = useState(1);
	const [inputValue, setInputValue] = useState("");

	const currentChan = chanList
		.filter(item => item.id === currentChanId)[0];

	/*
	** These lines are desirable to auto-scroll at bottom of chat.
	*/
	const convoRef = useRef<HTMLDivElement>(null);
	const anchorRef = useRef<HTMLDivElement>(null);
	useEffect(() => anchorRef.current?.scrollIntoView(), [msgList]);

	function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
		const elem: HTMLDivElement = convoRef.current!;

		if (elem?.scrollHeight - elem?.scrollTop === elem?.clientHeight)
			console.log("AT BOTTOM");

		if (e.currentTarget.value.slice(-1) !== "\n") {
			setInputValue(e.currentTarget.value);
			return ;
		}
		if (inputValue === "")
			return ;
		setMsgList(prev =>
			[...prev, {uid: 1, username: "mama", content: inputValue, date: "00:00"}]
		);
		setInputValue("");
	}

	return (
		<main className="MainContent Chat">
		{
			showChanList ?
			<div className={
				"Chat__Sidebar"
				+ (showChanList === -1 ? " collapse" : "")
				+ (showChanList === 2 ? " expand" : "")
			}>
				<h3 className="Chat__SidebarTitle">
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
				<div className="Chat__ChanList">
				{
					chanList.map(item =>
						<div
							key={item.id}
							className={`Chat__ChanListItem${item.id === currentChanId ? "--curr" : ""}`}
							onClick={() => {setCurrentChanId(item.id)}}
						>
							<div className="Chat__ChanListItemName">{item.name}</div>
							{
								item.size > 2 &&
								<div className="Chat__ChanListItemSize">
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
				<div className="Chat__Convo" ref={convoRef}>
					<div className="notice-msg Chat__Start">
						{
							currentChan.size === 2 ?
							`Start of your conversation with ${currentChan.name}` :
							`Start of channel « ${currentChan.name} »`
						}
						<hr />
					</div>
					{
					msgList.map((item, index) =>
						<Msg
							key={index}
							data={item}
							prev={index ? msgList[index - 1] : null}
							next={index < msgList.length ? msgList[index + 1] : null}
							size={currentChan.size}
						/>)
					}
					<div ref={anchorRef} />
				</div>
				<div className="Chat__Input">
					<textarea
						placeholder={`Send a message to « ${currentChan.name} »`}
						value={inputValue}
						onChange={handleInputChange}
					/>
				</div>
			</div>
		</main>
	);
}

// <Msg /> =====================================================================

function Msg(
	{data, prev, next, size}:
	{data: MsgType, prev: MsgType | null, next: MsgType | null, size: number}
)
{
	const connectPrev = prev && prev.uid === data.uid && prev.date === data.date;
	const connectNext = next && next.uid === data.uid && next.date === data.date;

	return (
		<div className={
			"Msg"
			+ (data.uid === 1 ? " me" : "")
			+ (connectPrev ? " connectPrev": "")
			+ (connectNext ? " connectNext" : "")
		}>
			<div className="Msg__PictureDiv">
				<img src={defaultPicture} />
			</div>
			<div>
			{
				<div className="Msg__Info">
					<span
						className="Msg__Sender"
						style={{color: `hsl(${(360 / size) * data.uid} 80% 80%)`}}
					>
						{data.username}
					</span>
					<span className="notice-msg Msg__Date">
						{data.date}
					</span>
				</div>
			}
				{data.content}
			</div>
		</div>
	);
}