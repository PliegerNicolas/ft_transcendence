import { useContext, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { ChatContext, MyContext } from "../../utils/contexts.ts";

import { socket } from "../../App.tsx"

import "../../styles/chat.css";

import ChatSidebar from "./ChatSidebar.tsx";
import NewChan from "./ChanEdit.tsx";
import ChatContent from "./ChatContent.tsx";
import { useQuery } from "@tanstack/react-query";
import { stopOnHttp, useInvalidate } from "../../utils/utils.ts";

// <Chat /> ====================================================================

export default function ChatTest()
{
	const [showSidebar, setShowSidebar] =
		useState(+(document.body.clientWidth > 900));

		const context = useContext(MyContext);
		const invalidate = useInvalidate();

		const getMe = useQuery({
			queryKey: ["me"],
			queryFn: () => context.api.get("/game/me"),
			retry: stopOnHttp,
		});

		const getChans = useQuery({
			queryKey: ["channels", ],
			queryFn: () => context.api.get("/channels/" + getMe.data),
			retry: stopOnHttp
		});

		useEffect(() => {
			console.log('use effect ?');
			socket.on('rejoinChannels', () => {
				console.log('rejoinChannels caught');
				if (getChans.isSuccess) {
					console.log('rejoinChannels successfull', getChans.data.id);
					socket.emit('joinChannel', getChans.data.id);
				}
			});
			socket.on('onMessage', (content: string, channel: string) => {
				console.log('onMessage caught');
				invalidate(["channels", channel, "messages"]);
				context.addNotif({ content: content });
				console.log(content);
			});
			return () => {
				socket.off('onMessage');
				socket.off('rejoinsChannels');
			};
		}, []);
	
	return (
		<main className="MainContent Chat">
			<ChatContext.Provider value={{showSidebar, setShowSidebar}}>
				{ !!showSidebar && <ChatSidebar /> }
				<Routes>
					<Route path="/" element={
						<div className="ChatContent nochan">
							No open channel
						</div>
					}/>
					<Route path="/:id/*" element={ <ChatContent/> } />
					<Route path="/new" element={ <NewChan id={0} /> } />
				</Routes>
			</ChatContext.Provider>
		</main>
	);
}