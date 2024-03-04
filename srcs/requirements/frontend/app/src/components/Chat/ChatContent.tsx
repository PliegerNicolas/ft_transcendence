import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

import Spinner from "../Spinner.tsx";

import { useInvalidate, useStopOnHttp } from "../../utils/utils.ts";
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

function ChatContent()
{
	const { api, addNotif, setLastChan } = useContext(MyContext);
	const invalidate = useInvalidate();
	const stopOnHttp = useStopOnHttp();

	const params = useParams();
	const id = params.id!;

	const getChan = useQuery({
		queryKey: ["chan", id],
		queryFn: () => api.get("/channels/" + id),
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

	useEffect(() => setLastChan(id), [id]);

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
		setInputValue("");
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

	if (getMsgs.isPending) {
		return (
			<div className="ChatContent">
				<ChatHeader name={getChan.data.name} edit={false} />
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
			<ChatHeader name={getChan.data.name} edit={false} />
			<div className="Chat__Convo">
				<div className="notice-msg Chat__Start">
					{
						getChan.data.membersCount === 2 ?
							`Start of your conversation with ${getChan.data.name}` :
							`Start of channel « ${getChan.data.name} »`
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
							size={getChan.data.membersCount}
						/>
					)
				}
				<div ref={anchorRef} />
			</div>
			<div className="Chat__Input">
				<textarea
					placeholder={`Send a message to « ${getChan.data.name} »`}
					value={inputValue}
					onChange={handleInputChange}
				/>
			</div>
		</div>
	);
}