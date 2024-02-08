import { useState, useRef, useEffect, useContext } from "react";
import { Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import Spinner from "./Spinner.tsx";

import { useInvalidate } from "../utils/utils.ts";
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
	const [showSidebar, setShowSidebar] = useState(1);

	return (
		<main className="MainContent Chat">
			<ChatContext.Provider value={{showSidebar, setShowSidebar}}>
				{ !!showSidebar && <ChatSidebar /> }
				<Routes>
					<Route path="/:id" element={ <ChatContent/> } />
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
	const id = idArray?.length ? idArray[0].slice(1) : 0;

	const { showSidebar } = useContext(ChatContext);

	const context = useContext(MyContext);

	const getChans = useQuery({
		queryKey: ["allChans"],
		queryFn: () => context.api.get("/channels")
	});

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
			<hr />
			<h4 className="ChatSidebar__Title">
				All channels:
			</h4>
			{
				getChans.isSuccess &&
					<div className="Chat__Chanlist">
					{
						getChans.data.map((chan : {id: string, name: string}) =>
							<Link
								to={chan.id}
								className={`Chat__ChanListItem ${id === chan.id && "curr"}`}
								key={chan.id}
							>
								<div className="Chat__ChanListItemName">{chan.name}</div>
								<div className="Chat__ChanListItemSize">?? members</div>
							</Link>)
					}
					</div>
				|| getChans.isPending &&
					<Spinner />
				|| getChans.isError &&
					<div className="error-msg" style={{marginLeft: "25px"}}>
						{getChans.error.message}
					</div>
			}
		</div>
	);
}

// <NewChan /> =================================================================

function NewChan()
{
	const [newChan, setNewChan] = useState({
		id: "",
		size: 1,
		name: "New Channel",
		mode: "public",
		password: "",
		allowed: [],
		admins: [],
	});

	const api = new Api(`http://${location.hostname}:3450`);
	const invalidate = useInvalidate();

	const chanPost = useMutation({
		mutationFn: (name: string) => api.post("/users/1/channels", {name}),
		onSettled: () => invalidate(["allChans"])
	});

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setNewChan({
			...newChan,
			[e.target.name]: e.currentTarget.value
		});
	}

	function handleSubmit() {
		chanPost.mutate(newChan.name);
		setNewChan({...newChan, name: ""});
	}

	return (
		<form className="NewChan">
			<ChatHeader chan={newChan} />
			<label className="NewChan__NameLabel" htmlFor="channelName">Name</label>
			<input
				type="text"
				id="channelName"
				name="name"
				value={newChan.name}
				onChange={handleChange}
				placeholder="Channel name cannot be empty!"
			/>
			<h4 className="NewChan__Title">Mode</h4>
			<div className="NewChan__Mode">
			<label htmlFor="modePublic">Public</label>
			<input
				type="radio"
				id="modePublic"
				name="mode"
				value="public"
				onChange={handleChange}
				checked={newChan.mode === "public"}
			/>
			<label htmlFor="modePrivate">Private</label>
			<input
				type="radio"
				id="modePrivate"
				name="mode"
				value="private"
				onChange={handleChange}
				checked={newChan.mode === "private"}
			/>
			</div>
			<button onClick={handleSubmit}>Submit</button>
		</form>
	);
}

// <ChatContent /> =============================================================

function ChatContent()
{
	const {api, addNotif} = useContext(MyContext);
	const invalidate = useInvalidate();

	const params = useParams();
	const id = params.id!;

	const getChan = useQuery({
		queryKey: ["channels", id],
		queryFn: () => api.get("/users/1/channels/"),
	});

	const getMsgs = useQuery({
		queryKey: ["channels", id, "messages"],
		queryFn: () => api.get("/users/1/channels/" + id + "/messages"),
	});

	const postMsg = useMutation({
		mutationFn: (content: string) =>
			api.post("/users/1/channels/" + id + "/messages", {content}),
		onSettled: () => invalidate(["channels", id, "messages"]),
		onError: error => addNotif(error.message),
	});

	const chan =
		getChan.isSuccess ?
			getChan.data.filter((item: ChanType) => (item.id === id))[0] :
			undefined;

	/*
	** These lines are desirable to auto-scroll at bottom of chat.
	*/
	const anchorRef = useRef<HTMLDivElement>(null);
	useEffect(() => anchorRef.current?.scrollIntoView(), [getMsgs]);

	const [inputValue, setInputValue] = useState("");
	function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {

		if (e.currentTarget.value.slice(-1) !== "\n") {
			setInputValue(e.currentTarget.value);
			return ;
		}

		if (!inputValue)
			return ;

		postMsg.mutate(inputValue);
		setInputValue("");
	}

	return (
		getChan.isPending &&
			<div style={{width: "calc(100% - 240px)", marginTop: "30px"}}>
				<Spinner />
			</div>
		|| getChan.isError &&
			<div className="error-msg" style={{margin: "30px"}}>
				Failed to load: {getChan.error.message}
			</div>
		|| getChan.isSuccess &&
		(
			getMsgs.isSuccess &&
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
					getMsgs.data.map((item: any, index: any) =>
						<Msg
							key={index}
							data={item}
							prev={index ? getMsgs.data[index - 1] : null}
							next={index < getMsgs.data.length ? getMsgs.data[index + 1] : null}
							size={42}
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
		)
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