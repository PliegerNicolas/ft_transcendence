import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import { ChatContext } from "../../utils/contexts.ts";

import { io } from 'socket.io-client';

import "../../styles/chat.css";

import ChatSidebar from "./ChatSidebar.tsx";
import NewChan from "./NewChan.tsx";
import ChatContent from "./ChatContent.tsx";

export const socket = io(`http://${location.hostname}:3450/chat`);

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