import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import { ChatContext } from "../../utils/contexts.ts";

import "../../styles/chat.css";

import ChatSidebar from "./ChatSidebar.tsx";
import NewChan from "./ChanEdit.tsx";
import ChatContent from "./ChatContent.tsx";

// <Chat /> ====================================================================

export default function Chat()
{
	const [showSidebar, setShowSidebar] =
		useState(+(document.body.clientWidth > 900));

/*	useEffect(() => {
		socket.on('rejoinChannels', () => {
			if (getChan.isSuccess) {
				console.log('rejoinChannels caught', getChan.data.name);
				socket.emit('joinChannel', getChan.data.name);
			}
		});
		socket.on('onMessage', (content: string) => {
			console.log('onMessage caught');
			invalidate(["channels", id, "messages"]);
			addNotif({ content: content });
			console.log(content);
		});
		return () => {
			socket.off('onMessage');
			socket.off('rejoinsChannels');
		};
	}, []);*/
	
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