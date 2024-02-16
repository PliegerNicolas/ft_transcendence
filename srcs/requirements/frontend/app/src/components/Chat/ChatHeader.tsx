import { useContext } from "react";
import { Link } from "react-router-dom";

import { ChanType } from "../../utils/types.ts";
import { ChatContext } from "../../utils/contexts";

import closeLeft from "../../assets/close-left.svg";
import openLeft from "../../assets/open-left.svg";
import editIcon from "../../assets/edit.svg";

import "../../styles/chat.css";

// <ChatHeader /> ==============================================================

export default function ChatHeader(
	{chan, edit}:
	{chan: ChanType, edit: boolean}
)
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
			<div className="ChatHeader__Main">
				<div className="ChatHeader__Title">
					{chan.name}
				</div>
				{
					!edit &&
					<Link to="edit" className="ChatHeader__Edit">
						<img src={editIcon} />
					</Link>
				}
			</div>
		</div>
	);
}