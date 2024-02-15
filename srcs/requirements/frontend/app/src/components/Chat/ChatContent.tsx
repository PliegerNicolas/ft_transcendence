import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

import Spinner from "../Spinner.tsx";

import { useInvalidate, stopOnHttp } from "../../utils/utils.ts";
import { ChanType } from "../../utils/types.ts";
import { MyContext } from "../../utils/contexts";

import "../../styles/chat.css";

import ChatHeader from "./ChatHeader.tsx";
import Msg from "./Msg.tsx";
import ChanEdit from "./ChanEdit.tsx";

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

function ChatContent() {
	const { api, addNotif } = useContext(MyContext);
	const invalidate = useInvalidate();

	const params = useParams();
	const id = params.id!;

	const getChan = useQuery({
		queryKey: ["allChans"],
		queryFn: () => api.get("/channels"),
		retry: stopOnHttp
	});

	const getMsgs = useQuery({
		queryKey: ["channels", id, "messages"],
		queryFn: () => api.get("/channels/" + id + "/messages"),
		retry: stopOnHttp
	});

	const postMsg = useMutation({
		mutationFn: (content: string) =>
			api.post("/channels/" + id + "/messages", { content }),
		onSettled: () => invalidate(["channels", id, "messages"]),
		onError: error => addNotif({ content: error.message }),
	});

	const chan =
		getChan.isSuccess ?
			getChan.data.filter((item: ChanType) => (item.id === id))[0] :
			null;

	/*
	** These lines are desirable to auto-scroll at bottom of chat.
	*/
	const anchorRef = useRef<HTMLDivElement>(null);
	useEffect(() => anchorRef.current?.scrollIntoView(), [getMsgs]);

	const [inputValue, setInputValue] = useState("");
	function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {

		if (e.currentTarget.value.slice(-1) !== "\n") {
			setInputValue(e.currentTarget.value);
			return;
		}

		if (!inputValue)
			return;

		postMsg.mutate(inputValue);
		setInputValue("");
	}

	if (getChan.isPending) return (
		<div className="ChatContent spinner">
			<Spinner />
		</div>
	);

	if (getChan.isError) return (
		<div className="ChatContent error">
			Failed to load: {getChan.error.message}
		</div>
	);

	if (getMsgs.isError) return (
		<div className="ChatContent error">
			Failed to load this channel: {getMsgs.error.message}
		</div>
	);

	if (!chan) return (
		<div className="ChatContent error">
			This channel doesn't exist, or you may not have access to it.
		</div>
	);

	if (getMsgs.isPending) {
		return (
			<div className="ChatContent">
				<ChatHeader chan={chan} edit={false} />
				<Spinner />
			</div>
		);
	}

	return (
		<div className="ChatContent">
			<ChatHeader chan={chan} edit={false} />
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
					getMsgs.data.map((item: any, index: number) =>
						<Msg
							key={index}
							data={item}
							prev={index ? getMsgs.data[index - 1] : null}
							next={index < getMsgs.data.length ? getMsgs.data[index + 1] : null}
							size={chan.membersCount}
						/>
					)
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