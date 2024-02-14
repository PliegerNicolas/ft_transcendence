import { useContext } from "react";

import { ChanType } from "../../utils/types.ts";
import { ChatContext } from "../../utils/contexts";

import closeLeft from "../../assets/close-left.svg";
import openLeft from "../../assets/open-left.svg";

import "../../styles/chat.css";

// <ChatHeader /> ==============================================================

export default function ChatHeader({chan}: {chan: ChanType})
{
	const {showSidebar, setShowSidebar} = useContext(ChatContext);

	return (
		<div className="Chat__Header">
			<div className="Chat__Collapse" onClick={() => {
				setShowSidebar(showSidebar < 1 ? 2 : -1);
				setTimeout(() => {setShowSidebar(showSidebar < 1 ? 1 : 0)}, 400);
			}}>
				<img src={showSidebar < 1 ? openLeft : closeLeft} />
			</div>
			<div className="Chat__Title">
				{chan.name}
			</div>
		</div>
	);
}