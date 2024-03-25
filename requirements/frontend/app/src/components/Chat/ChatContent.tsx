import { useState, useRef, useEffect, useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

import Spinner from "../Spinner.tsx";

import { useInvalidate, useMutateError, useGet, useDmName, useRetryMutate, useRelation } from "../../utils/hooks.ts";
import { getChanRole, httpStatus, isMuted, muteDelay } from "../../utils/utils.ts";

import { ChatContentContext, MyContext } from "../../utils/contexts";

import { socket } from "../../App.tsx"

import "../../styles/chat.css";

import ChatHeader from "./ChatHeader.tsx";
import Msg from "./Msg.tsx";
import ChanEdit from "./ChanEdit.tsx";
import ConfirmPopup from "../ConfirmPopup.tsx";
import { ChanSpecsType, MemberType, MsgType } from "../../utils/types.ts";
import RelationshipActions from "../RelationshipActions.tsx";

// <ChatContentRouter /> =======================================================

export default function ChatContentRouter()
{
	const { api, me } = useContext(MyContext);

	const invalidate = useInvalidate();
	const mutateError = useMutateError();
	const getDmName = useDmName();

	const params = useParams();
	const id = params.id!;

	const getChan = useGet(["channels", id]);

	const join = useMutation({
		mutationFn: (password: string) =>
			api.patch("/channels/" + id + "/join", {password}),
		onSettled: () => invalidate(["channels"]),
		onError: mutateError,
		onSuccess: (data: ChanSpecsType) => socket.emit('joinChannel', data.channel.name)
	});

	const [password, setPasswd] = useState("");

	const idMap = useMemo(() => {
		let ret: {[memberId: string]: number} = {};

		if (!getChan.isSuccess)
			return (ret);

		getChan.data.channel.activeMembers
			.sort((a: MemberType, b: MemberType) => +a.user.id - +b.user.id)
			.forEach((member: MemberType, index: number) =>
			ret[member.id] = index
		);
		return (ret);
	}, [getChan.data]);

	if (getChan.isPending) return (
		<div className="ChatContent spinner">
			<Spinner />
		</div>
	);

	if (getChan.isError && httpStatus(getChan.error) !== 403) return (
		<div className="ChatContent error">
			Failed to load this channel: {getChan.error.message}
		</div>
	);

	if (getChan.isError && getChan.error.message.includes("password")) return (
		<div className="ChatContent ChatContent__Mdp">
			<div className="notice-msg">
				A password is required to join this channel:
			</div>
			<div className="ChatContent__MdpInput">
				<input
					type="password"
					value={password}
					onChange={(ev) => setPasswd(ev.currentTarget.value)}
					placeholder="Password"
				/>
				<button onClick={() => {join.mutate(password); setPasswd("")}}>
					Join
				</button>
			</div>
		</div>
	);

	if (getChan.isError) return (
		<div className="ChatContent ChatContent__Mdp">
			<div style={{fontSize: "2rem", marginBottom: "12px"}}>💀</div>
			<div className="error-msg">
				{
					getChan.error.message.includes("permitted") ?
					"You've been banned from this channel" :
					"This channel requires an invitation to join."
				}
			</div>
		</div>
	);

	return (
		<ChatContentContext.Provider value={{
			chan: getChan.data.channel,
			role: getChanRole(getChan.data.channel, me!.id),
			idMap,
			dmName: getDmName(getChan.data.channel),
		}}>
			<Routes>
				<Route path="/" element={<ChatContent />} />
				<Route path="/edit" element={<ChanEdit id={+id}/>} />
				<Route path="/*" element={
					<div className="ChatContent error">No such page...</div>
				}/>
			</Routes>
		</ChatContentContext.Provider>
	);
}

// <ChatContent /> =============================================================

function ChatContent()
{
	const { api, setLastChan, me } = useContext(MyContext);
	const { chan, role, dmName } = useContext(ChatContentContext);

	const relation = useRelation(dmName);

	const invalidate = useInvalidate();
	const mutateError = useMutateError();
	const navigate = useNavigate();
	const retryMutate = useRetryMutate();

	const params = useParams();
	const id = params.id!;

	const getMsgs = useGet(["channels", id, "messages"]);

	const postMsg = useMutation({
		mutationFn: (content: string) =>
			api.post("/channels/" + id + "/messages", { content }),
		onSettled: () => invalidate(["channels", id, "messages"]),
		onError: mutateError,
		retry: retryMutate,
	});

	const join = useMutation({
		mutationFn: (password: string) =>
			api.patch("/channels/" + id + "/join", {password}),
		onSettled: () => invalidate(["channels"]),
		onSuccess: () => {
			socket.emit("channelAction");
			socket.emit('joinChannel', chan.name);
		},
		onError: mutateError,
		retry: retryMutate,
	});

	const leave = useMutation({
		mutationFn: () =>
			api.patch("/channels/" + id + "/leave", {}),
		onSuccess: () => {
			if (chan.membersCount <= 1)
				navigate("/chat");
			setTimeout(() => invalidate(["channels"]), 50);
		},
		onError: mutateError,
		retry: retryMutate,
	});

	useEffect(() => setLastChan(id), [id]);

	useEffect(() => {
		socket.on('onMessage', () => {
			setTimeout(() => {
				invalidate(["channels", id, "messages"]);
				invalidate(["channels", id]);
			}, 100
			);
			//console.log('onMessage caught', content);
		});
		socket.on("updateChannel", () => {
			invalidate(["channels", id]);
		});
		socket.on('refreshPage', () => {
			window.location.reload();
		});
		socket.emit('rejoinChannels');
		return (() => {
			socket.off('onMessage');
			socket.off('rejoinChannels');
			socket.off('refreshPage');
			socket.off('updateChannel');
		});
	}, []);

	/*
	** These lines are desirable to auto-scroll at bottom of chat.
	*/
	const anchorRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (anchorRef.current)
			anchorRef.current.scrollIntoView()
	}, [getMsgs]);

	const [inputValue, setInputValue] = useState("");
	function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {

		if (e.currentTarget.value.slice(-1) !== "\n") {
			setInputValue(e.currentTarget.value);
			return;
		}

		if (!inputValue)
			return;

		postMsg.mutate(inputValue);
		socket.emit('newMessage', { content: inputValue, channel: chan.name });
		setInputValue("");
	}

	function handleJoinChannel(password: string) {
		join.mutate(password);
	}

	const [popup, setPopup] =
		useState<{text: JSX.Element, action: Function} | null>(null);

	function popupFn(text: JSX.Element, action: Function) {
		setPopup({
			text,
			action: () => {action(); setPopup(null)},
		});
	}

	const [leavePopup, setLeavePopup] = useState(false);

	const mutedMember = chan.mutedMembers.find(member => member.user.id === me!.id);

	const [duration, setDuration] = useState(muteDelay(mutedMember));

	useEffect(() => {
		const timerId = setInterval(() => {
			setDuration(muteDelay(mutedMember));
			if (muteDelay(mutedMember) < 0) {
				clearInterval(timerId);
				invalidate(["channels", chan.id]);
			}
		}, 1000);
		return (() => clearInterval(timerId))
	}, [chan]);

	if (getMsgs.isPending) {
		return (
			<div className="ChatContent">
				<ChatHeader name={chan.name} edit={role !== "owner"} leave={null} />
				<Spinner />
			</div>
		);
	}

	if (getMsgs.isError) return (
		<div className="ChatContent error">
			Failed to load this channel's messages: {getMsgs.error.message}
		</div>
	);

	return (
		<div className="ChatContent">
			<ChatHeader
				name={chan.name}
				edit={role !== "owner" && role != "operator"}
				leave={role ? () => setLeavePopup(true) : null}
			/>
			<div className="Chat__Convo">
				<div className="notice-msg Chat__Start">
					{
						dmName ?
						"Start of your conversation with " + dmName :
						"Start of channel « " + chan.name + " »"
					}
					<hr />
				</div>
				{
					getMsgs.data
						.sort((a: MsgType, b: MsgType) => a.createdAt > b.createdAt)
						.map((item: MsgType, index: number) =>
						<Msg
							key={item.createdAt}
							data={item}
							prev={index ? getMsgs.data[index - 1] : null}
							next={index < getMsgs.data.length ? getMsgs.data[index + 1] : null}
							popupFn={popupFn}
						/>
					)
				}
				<div ref={anchorRef} />
			</div>
			{
				role && isMuted(chan, me!.id) &&
				<div className="Chat__Input join">
					You are muted on this channel,
					{duration > 0 && " (" + duration + "s remaining)"}
					<br />and thus cannot send messages to it.
				</div> ||
				role &&
				<div className="Chat__Input">
					<textarea
						id="SendMessage"
						placeholder={
							dmName ?
							`Send a message to ${dmName}` :
							`Send a message to « ${chan.name} »`
						}
						value={inputValue}
						onChange={handleInputChange}
					/>
				</div> ||
				chan.mode !== "private" &&
				<div className="Chat__Input join">
					Join this channel to interact with it.
					<button onClick={() => handleJoinChannel("")}>
						Join
					</button>
				</div> ||
				chan.mode === "private" &&
				<div className="Chat__Input join Chat__DmRequest">
				{
					relation !== "blocked" &&
					<div className="Chat__Initiator">
						{dmName} has started this conversation.
						<button className="accept" onClick={() => handleJoinChannel("")}>
							Join the conversation
						</button>
					</div>
				}
					<RelationshipActions name={dmName} showStatus={true}/>
				</div>
			}
			{
				popup &&
				<ConfirmPopup
					title="Confirmation"
					text={popup.text}
					action="Confirm"
					actionFt={popup.action}
					cancelFt={() => setPopup(null)}
				/>
			}
			{
				leavePopup &&
				<ConfirmPopup
					title={"Leaving " + chan.name}
					text={<>Are you sure you want to leave {chan.name}?</>}
					action="Leave"
					actionFt={() => {leave.mutate(); setLeavePopup(false)}}
					cancelFt={() => {setLeavePopup(false)}}
				/>
			}
		</div>
	);
}