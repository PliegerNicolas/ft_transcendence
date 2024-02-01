import { useState, useRef, useEffect, useContext } from "react";
import { Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import { UseQueryResult, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Api from "../utils/Api"
import { ChanType, MsgType } from "../utils/types";
import { ChatContext, MyContext } from "../utils/contexts";

import closeLeft from "../assets/close-left.svg";
import openLeft from "../assets/open-left.svg";
import add from "../assets/add.svg";
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

	return (
		<main className="MainContent Chat">
			<ChatContext.Provider value={{showSidebar, setShowSidebar, chanList}}>
				{ !!showSidebar && <ChatSidebar /> }
				<Routes>
					<Route path="/:id" element={ <ChatContent setMsgs={setMsgList}/> } />
					<Route path="/new" element={ <NewChan /> } />
				</Routes>
			</ChatContext.Provider>
		</main>
	);
}

// <ChatSidebar /> =============================================================

function ChatSidebar()
{
	const loc = useLocation();
	const idArray = loc.pathname.match(/\/[^/]*$/);
	const id = idArray?.length ? +idArray[0].slice(1) : 0;

	const {showSidebar, chanList} = useContext(ChatContext);

	const context = useContext(MyContext);

	return (
		<div className={
			`ChatSidebar ${showSidebar < 0 && "collapse"} ${showSidebar > 1 && "expand"}`
		}>
			<h3 className="ChatSidebar__Title">
				Your channels
				<Link to="new" className="ChatSidebar__Add">
					<img src={add} />
				</Link>
			</h3>
			<div className="Chat__ChanList">
			{
				chanList.map(item =>
					<Link
						to={`${item.id}`}
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
			{/* Just a test to see how we could display public channels*/}
			<h4 className="ChatSidebar__Title">
				All channels:
			</h4>
			{
				context.allChans?.isSuccess &&
				<div className="Chat__Chanlist">
				{
					context.allChans.data.map((chan : {id: number, name: string}) =>
						<div className="Chat__ChanListItem" key={chan.id}>
							<div className="Chat__ChanListItemName">{chan.name}</div>
							<div className="Chat__ChanListItemSize">?? members</div>
						</div>
					)
				}
				</div>
			}
		</div>
	);
}

// <NewChat /> =================================================================

function NewChan()
{
	const [newChan, setNewChan] = useState({
		id: -1,
		name: "New Channel",
		size: 1,
		msgs: []
	});

	const api = new Api(`http://${location.hostname}:3450`);

	const queryClient = useQueryClient();

	const chanPost = useMutation({
		mutationFn: (name: string) => api.post("/users/1/channels", {name}),
		onSettled: () => invalidateQuery(["allChans"])
	});

	function invalidateQuery(key: string[]) {
		queryClient.invalidateQueries({queryKey: key});
	}

	function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
		setNewChan({...newChan, name:e.currentTarget.value});
	}

	function handleSubmit() {
		chanPost.mutate(newChan.name);
		setNewChan({...newChan, name: ""});
	}

	return (
		<div className="NewChan">
			<ChatHeader chan={newChan} />
			<label htmlFor="channel-name">Name:</label>
			<br />
			<input
				type="text"
				id="channel-name"
				name="channel-name"
				value={newChan.name}
				onChange={handleNameChange}
				placeholder="Channel name cannot be empty!"
			/>
			<br />
			<button onClick={handleSubmit}>Submit</button>
		</div>
	);
}

// <ChatContent /> =============================================================

function ChatContent({setMsgs}: {setMsgs: Function})
{
	const {chanList} = useContext(ChatContext);

	const params = useParams();
	const chan = chanList.filter(item => item.id === +params.id!)[0];

	/*
	** These lines are desirable to auto-scroll at bottom of chat.
	*/
	const anchorRef = useRef<HTMLDivElement>(null);
	useEffect(() => anchorRef.current?.scrollIntoView(), [chan?.msgs]);

	/*
	** Manage the input. If the last char is "\n", the textarea is cleared and the
	** message is added to the list. Of course, it should be send to the server
	** instead!
	*/
	const [inputValue, setInputValue] = useState("");
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

	if (!chan) return (
		<div style={{margin: "24px"}}>
			<span className="error-msg">404: this chan doesn't seem to exist</span>
			<span style={{marginLeft: "8px"}}>😢</span>
		</div>
	);

	return (
		<div className="Chat__Content">
			<ChatHeader chan={chan} />
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

// <ChatHeader /> ==============================================================

function ChatHeader({chan}: {chan: ChanType})
{
	const {showSidebar, setShowSidebar} = useContext(ChatContext);

	return (
		<div className="Chat__Header">
			<div className="Chat__Collapse" onClick={() => {
				setShowSidebar(showSidebar < 1 ? 2 : -1);
				setTimeout(() => {setShowSidebar(showSidebar < 1 ? 1 : 0)}, 200);
			}}>
				<img src={showSidebar < 1 ? openLeft : closeLeft} />
			</div>
			<div className="Chat__Title">
				{chan.name}
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
				<Link to={"/user/" + data.uid}>
					<img src={defaultPicture} />
				</Link>
			</div>
			<div>
			{
				<div className="Msg__Info">
					<Link
						to={"/user/" + data.uid}
						className="Msg__Sender"
						style={{color: `hsl(${(360 / size) * data.uid} 80% 80%)`}}
					>
						{data.username}
					</Link>
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