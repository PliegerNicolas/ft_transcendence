import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

import Spinner from "../Spinner.tsx";

import { useInvalidate, useMutateError, useGet } from "../../utils/hooks.ts";
import { getChanRole } from "../../utils/utils.ts";

import { MyContext } from "../../utils/contexts";

import { socket } from "../../App.tsx"

import "../../styles/chat.css";

import ChatHeader from "./ChatHeader.tsx";
import Msg from "./Msg.tsx";
import ChanEdit from "./ChanEdit.tsx";
import ConfirmPopup from "../ConfirmPopup.tsx";

// <ChatContentRouter /> =======================================================

export default function ChatContentRouter()
{
	const params = useParams();
	const id = params.id!;

	return (
		<Routes>
			<Route path="/" element={<ChatContent />} />
			<Route path="/edit" element={<ChanEdit id={+id}/>} />
			<Route path="/*" element={
				<div className="ChatContent error">No such channel!</div>
			}/>
		</Routes>
	);
}

// <ChatContent /> =============================================================

function ChatContent()
{
	const { api, setLastChan } = useContext(MyContext);
	const invalidate = useInvalidate();
	const mutateError = useMutateError();

	const params = useParams();
	const id = params.id!;

	const getChan = useGet(["channels", id]);
	const getMsgs = useGet(["channels", id, "messages"]);
	const getMe = useGet(["me"]);

	const postMsg = useMutation({
		mutationFn: (content: string) =>
			api.post("/channels/" + id + "/messages", { content }),
		onSettled: () => invalidate(["channels", id, "messages"]),
		onError: mutateError,
	});

	const join = useMutation({
		mutationFn: () => api.patch("/channels/" + id + "/join", {password: ""}),
		onSettled: () => invalidate(["channels", id]),
		onError: mutateError,
	});

	useEffect(() => setLastChan(id), [id]);

	useEffect(() => {
		socket.on('onMessage', (content: string) => {
			setTimeout(() => {
				invalidate(["channels", id, "messages"]);
				invalidate(["channels", id]);
			}, 100);
			console.log('onMessage caught', content);
		});
		socket.emit('rejoinChannels');
		return (() => {socket.off('onMessage')});
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
		socket.emit('newMessage', { content: inputValue, channel: getChan.data.name });
		setInputValue("");
	}

	const [popup, setPopup] =
		useState<{text: JSX.Element, action: Function} | null>(null);

	function popupFn(text: JSX.Element, action: Function) {
		setPopup({
			text,
			action: () => {action(); setPopup(null)},
		});
	}

	if (getChan.isPending) return (
		<div className="ChatContent spinner">
			<Spinner />
		</div>
	);

	if (getChan.isError) return (
		<div className="ChatContent error">
			Failed to load this channel: {getChan.error.message}
		</div>
	);

	const role = getMe.isSuccess ? getChanRole(getChan.data, getMe.data.id) : "";

	if (getMsgs.isPending) {
		return (
			<div className="ChatContent">
				<ChatHeader name={getChan.data.name} edit={role !== "owner"} />
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
			<ChatHeader name={getChan.data.name} edit={role !== "owner"} />
			<div className="Chat__Convo">
				<div className="notice-msg Chat__Start">
						Start of channel « {getChan.data.name} »
					<hr />
				</div>
				{
					getMsgs.data.map((item: any, index: number) =>
						<Msg
							key={index}
							data={item}
							prev={index ? getMsgs.data[index - 1] : null}
							next={index < getMsgs.data.length ? getMsgs.data[index + 1] : null}
							size={getChan.data.membersCount}
							role={role}
							me={getMe.data}
							popupFn={popupFn}
						/>
					)
				}
				<div ref={anchorRef} />
			</div>
			{
				role &&
				<div className="Chat__Input">
					<textarea
						id="SendMessage"
						placeholder={`Send a message to « ${getChan.data.name} »`}
						value={inputValue}
						onChange={handleInputChange}
					/>
				</div> ||
				<div className="Chat__Input join">
					Join this channel to interact with it.
					<button onClick={() => join.mutate()}>
						Join
					</button>
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
		</div>
	);
}