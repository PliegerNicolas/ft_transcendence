import { useContext, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { ChatContext } from "../../utils/contexts.ts";

import closeLeft from "../../assets/close-left.svg";
import openLeft from "../../assets/open-left.svg";

import "../../styles/chat.css";

import ChatSidebar from "./ChatSidebar.tsx";
import NewChan from "./ChanEdit.tsx";
import ChatContent from "./ChatContent.tsx";

// <Chat /> ====================================================================

export default function Chat()
{
	const [showSidebar, setShowSidebar] =
		useState(+(document.body.clientWidth > 900));

	return (
		<main className="MainContent Chat">
			<ChatContext.Provider value={{showSidebar, setShowSidebar}}>
				{ !!showSidebar && <ChatSidebar /> }
				<Routes>
					<Route path="/" element={
						<div className="ChatContent nochan">
							<NoChanHeader/>
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

function NoChanHeader()
{
	const {showSidebar, setShowSidebar} = useContext(ChatContext);

	return (
		<div className="ChatHeader">
			<div className="ChatHeader__Collapse" onClick={() => {
				setShowSidebar(showSidebar < 1 ? 2 : -1);
				setTimeout(() => {setShowSidebar(showSidebar < 1 ? 1 : 0)}, 400);
			}}>
				<img src={showSidebar < 1 ? openLeft : closeLeft} />
			</div>
		</div>
	);
}