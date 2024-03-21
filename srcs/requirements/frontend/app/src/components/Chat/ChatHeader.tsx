import { useContext } from "react";
import { Link } from "react-router-dom";

import { ChatContentContext, ChatContext } from "../../utils/contexts";

import closeLeft from "../../assets/close-left.svg";
import openLeft from "../../assets/open-left.svg";
import editIcon from "../../assets/edit.svg";

import "../../styles/chat.css";

// <ChatHeader /> ==============================================================

export default function ChatHeader(
	{name, edit, leave}:
	{name: string, edit: boolean, leave: Function | null})
{
	const {showSidebar, setShowSidebar} = useContext(ChatContext);
	const {dmName} = useContext(ChatContentContext);

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
					{dmName ? "@"+dmName : name}
				</div>
				<div className="ChatHeader__Right">
					{
						leave &&
						<button onClick={() => leave()}>
							Leave
						</button>
					}
					{
						!edit &&
						<Link to="edit" className="ChatHeader__Edit">
							<img src={editIcon} />
						</Link>
					}
				</div>
			</div>
		</div>
	);
}