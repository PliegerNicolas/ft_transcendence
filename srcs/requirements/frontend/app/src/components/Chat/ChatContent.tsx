import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import Spinner from "../Spinner.tsx";

import { useInvalidate } from "../../utils/utils.ts";
import { ChanType } from "../../utils/types.ts";
import { MyContext } from "../../utils/contexts";

import "../../styles/chat.css";

import ChatHeader from "./ChatHeader.tsx";
import Msg from "./Msg.tsx";

// <ChatContent /> =============================================================

export default function ChatContent()
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
			<div className="Chat__Content spinner">
				<Spinner />
			</div>
		|| getChan.isError &&
			<div className="error-msg" style={{margin: "30px"}}>
				Failed to load: {getChan.error.message}
			</div>
		|| getChan.isSuccess && getMsgs.isSuccess &&
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
	);
}