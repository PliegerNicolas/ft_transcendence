import { useContext } from "react";
import { useLocation, Link } from "react-router-dom";

import Spinner from "../Spinner.tsx";

import { useGet } from "../../utils/hooks.ts";
import { ChatContext } from "../../utils/contexts.ts";

import add from "../../assets/add.svg";

import "../../styles/chat.css";
import { ChanType } from "../../utils/types.ts";

// <ChatSidebar /> =============================================================

export default function ChatSidebar() {
	const loc = useLocation();
	const idArray = loc.pathname.match(/\/[^/]*$/);
	const id = idArray?.length ? idArray[0].slice(1) : "";

	const { showSidebar } = useContext(ChatContext);

	const getChans = useGet(["channels"]);

	return (
		<div className={
			`ChatSidebar ${showSidebar < 0 && "collapse"} ${showSidebar > 1 && "expand"}`
		}>
			<h3 className="ChatSidebar__Title">
				Your channels
				<Link to="new" className="ChatSidebar__Add">
					<img src={add} />
				</Link>
			</h3>
			<hr />
			<h4 className="ChatSidebar__Title">
				All channels:
			</h4>
			{
				getChans.isSuccess &&
				<div className="Chat__Chanlist">
					{
						getChans.data.map((chan: ChanType) =>
							<Link
								to={"" + chan.id}
								className={`Chat__ChanListItem ${id == chan.id && "curr"}`}
								key={chan.id}
							>
								<div className="Chat__ChanListItemName">
									{chan.name}
								</div>
								<div className="Chat__ChanListItemSize">
									{chan.membersCount} members
								</div>
							</Link>)
					}
				</div>
				|| getChans.isPending &&
				<Spinner />
				|| getChans.isError &&
				<div className="error-msg" style={{ marginLeft: "25px" }}>
					{getChans.error.message}
				</div>
			}
		</div>
	);
}