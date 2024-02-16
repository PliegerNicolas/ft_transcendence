import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import { ChatContext } from "../../utils/contexts.ts";

import "../../styles/chat.css";

import ChatSidebar from "./ChatSidebar.tsx";
import NewChan from "./ChanEdit.tsx";
import ChatContent from "./ChatContent.tsx";

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
					<Route path="/:id/*" element={ <ChatContent/> } />
					<Route path="/new" element={ <NewChan id={0} /> } />
				</Routes>
			</ChatContext.Provider>
		</main>
	);
}