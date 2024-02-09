import { useState, useRef, useEffect, useContext } from "react";
import { Routes, Route, Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { MutationFunction, useMutation, useQuery } from "@tanstack/react-query";

import Spinner from "./Spinner.tsx";

import { useInvalidate } from "../utils/utils.ts";
import { ChanType, MsgType } from "../utils/types";
import { ChatContext, MyContext } from "../utils/contexts";

import close from "../assets/close.svg";
import radioChecked from "../assets/radio-checked.svg";
import radioUnchecked from "../assets/radio-unchecked.svg";
import closeLeft from "../assets/close-left.svg";
import openLeft from "../assets/open-left.svg";
import add from "../assets/add.svg";
import defaultPicture from "../assets/default_profile.png";

import "../styles/chat.css";

// <Chat /> ====================================================================

export default function ChatTest()
{
	const [showSidebar, setShowSidebar] =
		useState(+(document.body.clientWidth > 900));

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
		passwordRepeat: "",
		allowed: [],
		admins: [],
	});

	const { api } = useContext(MyContext);
	const invalidate = useInvalidate();
	const navigate = useNavigate();

	const postChan = useMutation({
		mutationFn:
			((name: string) => api.post("/users/1/channels", {name})) as
			MutationFunction<ChanType>,
		onSettled: () => invalidate(["allChans"]),
		onSuccess: (data: ChanType) => navigate("/chattest/" + data.id)
	});

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setNewChan({
			...newChan,
			[e.target.name]: e.currentTarget.value
		});
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		postChan.mutate(newChan.name);
	}

	return (
		<form className="NewChan MainContent" onSubmit={handleSubmit}>
			<ChatHeader chan={newChan} />
			<section>
			<label className="NewChan__NameLabel" htmlFor="channelName">Name</label>
			<input
				type="text"
				id="channelName"
				name="name"
				value={newChan.name}
				onChange={handleChange}
				placeholder="Cannot be empty!"
				required
			/>
			</section>
			<section>
			<span className="NewChan__Title">Mode</span>
			<span className="NewChan__ModeButtons">
				<label htmlFor="modePublic" className={`${newChan.mode === "public"}`}>
					Public
					<img src={newChan.mode === "public" ? radioChecked : radioUnchecked}/>
				</label>
				<input
					type="radio"
					id="modePublic"
					name="mode"
					value="public"
					onChange={handleChange}
					checked={newChan.mode === "public"}
				/>
				<label htmlFor="modePrivate" className={`${newChan.mode === "private"}`}>
					Private
					<img src={newChan.mode === "private" ? radioChecked : radioUnchecked}/>
				</label>
				<input
					type="radio"
					id="modePrivate"
					name="mode"
					value="private"
					onChange={handleChange}
					checked={newChan.mode === "private"}
				/>
			</span>
			</section>
			{
				newChan.mode === "public" &&
				<section>
					<div className="NewChan__Title">Password</div>
					<div className="NewChan__PasswdFields">
						<input
							type="password"
							id="channelPassword"
							name="password"
							value={newChan.password}
							onChange={handleChange}
							placeholder="Leave blank for no password"
						/>
						<br />
						<input
							type="password"
							id="channelPasswordRepeat"
							name="passwordRepeat"
							value={newChan.passwordRepeat}
							onChange={handleChange}
							placeholder="Repeat password"
						/>
						{
							!!newChan.password.length
								&& !!newChan.passwordRepeat.length
								&& newChan.password != newChan.passwordRepeat
								&& <span className="error-msg">Passwords do not match!</span>
						}
					</div>
				</section>
			}
			{
				newChan.mode === "private" &&
				<section>
					<div className="NewChan__Title">Allowed users</div>
					<div className="NewChan__UserList">

					</div>
				</section>
			}
			<section>
				<div className="NewChan__Title">Admins</div>
				<div className="NewChan__UserList">
					<div>
						<div>mlaneyri</div>
						<img src={close}/>
					</div>
					<div>
						<div>julboyer</div>
						<img src={close}/>
					</div>
					<div>
						<div>anbourge</div>
						<img src={close}/>
					</div>
					<div>
						<div>nplieger</div>
						<img src={close}/>
					</div>
					<div>
						<div><input type="text"/></div>
						<img src={add}/>
					</div>
				</div>
			</section>
			<button
				style={{marginLeft: "15px"}}
				disabled={
					newChan.mode === "public"
					&& newChan.password !== newChan.passwordRepeat
				}
			>
				Submit
			</button>
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
				setTimeout(() => {setShowSidebar(showSidebar < 1 ? 1 : 0)}, 400);
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