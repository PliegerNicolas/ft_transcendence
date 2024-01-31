import { useState, useRef, useEffect } from "react";
import { Routes, Route, useNavigate, Link, useParams, useLocation } from "react-router-dom";

import { MsgType, ChanType } from "../utils/types";

import closeLeft from "../assets/close-left.svg";
import openLeft from "../assets/open-left.svg";
import defaultPicture from "../assets/default_profile.png";

import "../styles/chat.css";

// <Chat /> ====================================================================

export default function ChatTest()
{
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

	const chanList = [
		{
			id: 1,
			name: "Un channel",
			size: 7,
			msgs: msgList
		},
		{
			id: 2,
			name: "julboyer, PliegerNicolas, Jonatesp, mayeul",
			size: 4,
			msgs: msgList
		},
		{
			id: 3,
			name: "PliegerNicolas",
			size: 2,
			msgs: msgList
		},
		{
			id: 4,
			name: "Jonatesp",
			size: 2,
			msgs: msgList
		},
		{
			id: 5,
			name: "La meilleure convo",
			size: 42,
			msgs: msgList
		},
		{
			id: 6,
			name: " julboyer",
			size: 2,
			msgs: msgList
		}
	];

	const [showSidebar, setShowSidebar] = useState(1);
	const navigate = useNavigate();

	useEffect(() => {navigate("/chattest/1")}, []);

	return (
		<main className="MainContent Chat">
		{
			!!showSidebar &&
			<ChatSidebar show={showSidebar} setShow={setShowSidebar} list={chanList}/>
		}
			<Routes>
				<Route path="/:id" element={
					<ChatContent
						showSidebar={showSidebar}
						setShowSidebar={setShowSidebar}
						chanList={chanList}
						setMsgs={setMsgList}/>
				}/>
			</Routes>
		</main>
	);
}

// <ChatSidebar /> =============================================================

function ChatSidebar(
	{show, setShow, list} : {show: number, setShow: Function, list: ChanType[]}
)
{
	const loc = useLocation();
	const idArray = loc.pathname.match(/\/[^/]*$/);
	const id = idArray?.length ? +idArray[0].slice(1) : 0;

	return (
		<div className={
			`ChatSidebar ${show < 0 && " collapse"} ${show > 1 && "expand"}`
		}>
			<h3 className="ChatSidebar__Title">
				Your channels
				<div
					className="Chat__Collapse"
					onClick={() => { setShow(-1); setTimeout(() => setShow(0), 200); }}
				>
					<img src={closeLeft} />
				</div>
			</h3>
			<div className="Chat__ChanList">
			{
				list.map(item =>
					<Link
						to={`/chattest/${item.id}`}
						key={item.id}
						className={`Chat__ChanListItem ${id === item.id && "curr"}`}
					>
						<div className="Chat__ChanListItemName">{item.name}</div>
						{
							item.size > 2 &&
							<div className="Chat__ChanListItemSize">
								{item.size} members
							</div>
						}
					</Link>
				)
			}
			</div>
		</div>
	);
}

// <ChatContent /> =============================================================

function ChatContent(
	{showSidebar, setShowSidebar, chanList, setMsgs}:
	{showSidebar: number, setShowSidebar: Function, chanList: ChanType[], setMsgs: Function}
)
{
	const params = useParams();
	const chan = chanList.filter(item => item.id === +params.id!)[0];

	const [inputValue, setInputValue] = useState("");

	/*
	** These lines are desirable to auto-scroll at bottom of chat.
	*/
	const anchorRef = useRef<HTMLDivElement>(null);
	useEffect(() => anchorRef.current?.scrollIntoView(), [chan.msgs]);

	/*
	** Manage the input. If the last char is "\n", the textarea is cleared and the
	** message is added to the list. Of course, it should be send to the server
	** instead!
	*/
	function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {

		if (e.currentTarget.value.slice(-1) !== "\n") {
			setInputValue(e.currentTarget.value);
			return ;
		}

		if (!inputValue)
			return ;

		setMsgs((prev: MsgType[]) =>
			[...prev, {uid: 1, username: "mama", content: inputValue, date: "00:00"}]
		);
		setInputValue("");
	}

	return (
		<div className="Chat__Content">
			<div className="Chat__Header">
			{
				showSidebar < 1 &&
				<div className="Chat__Collapse Chat__Expand" onClick={() => {
					setShowSidebar(2);
					setTimeout(() => {setShowSidebar(1)}, 200);
				}}>
					<img src={openLeft} />
				</div>
			}
				<div className="Chat__Title">
					{chan.name}
				</div>
			</div>
			<div className="Chat__Convo">
				<div className="notice-msg Chat__Start">
					{
						chan.size === 2 ?
						`Start of your conversation with ${chan.name}` :
						`Start of channel « ${chan.name} »`
					}
					<hr />
				</div>
				{
				chan.msgs.map((item, index) =>
					<Msg
						key={index}
						data={item}
						prev={index ? chan.msgs[index - 1] : null}
						next={index < chan.msgs.length ? chan.msgs[index + 1] : null}
						size={chan.size}
					/>)
				}
				<div ref={anchorRef} />
			</div>
			<div className="Chat__Input">
				<textarea
					placeholder={`Send a message to « ${chan.name} »`}
					value={inputValue}
					onChange={handleInputChange}
				/>
			</div>
		</div>
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
			`Msg
			${data.uid === 1 && "me"}
			${connectPrev && "connectPrev"}
			${connectNext && "connectNext"}`
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