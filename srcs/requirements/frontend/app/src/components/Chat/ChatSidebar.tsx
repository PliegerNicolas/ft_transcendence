import { useContext } from "react";
import { useLocation, Link } from "react-router-dom";

import Spinner from "../Spinner.tsx";

import { useGet } from "../../utils/hooks.ts";
import { ChatContext } from "../../utils/contexts.ts";

import add from "../../assets/add.svg";

import "../../styles/chat.css";
import { ChanSpecsType } from "../../utils/types.ts";

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
			{
				getChans.isSuccess &&
				<div className="Chat__Chanlist">
					{
						getChans.data
							.filter((chan: ChanSpecsType) => chan.isMember)
							.map((chan: ChanSpecsType) =>
							<Link
								to={"" + chan.channel.id}
								className={`Chat__ChanListItem ${id == chan.channel.id && "curr"}`}
								key={chan.channel.id}
							>
								<div className="Chat__ChanListItemName">
									{chan.channel.name}
								</div>
								<div className="Chat__ChanListItemSize">
									{chan.channel.membersCount} members
								</div>
							</Link>)
					}
				</div>
				|| (getChans.isPending) &&
				<Spinner />
				|| getChans.isError &&
				<div className="error-msg" style={{ marginLeft: "25px" }}>
					{getChans.error.message}
				</div>
			}
			<hr />
			<h4 className="ChatSidebar__Title">
				All channels:
			</h4>
			{
				getChans.isSuccess &&
				<div className="Chat__Chanlist">
					{
						getChans.data
							.filter((chan: ChanSpecsType) => !chan.isMember)
							.map((chan: ChanSpecsType) =>
							<Link
								to={"" + chan.channel.id}
								className={`Chat__ChanListItem ${id == chan.channel.id && "curr"}`}
								key={chan.channel.id}
							>
								<div className="Chat__ChanListItemName">
									{chan.channel.name}
								</div>
								<div className="Chat__ChanListItemSize">
									{chan.channel.membersCount} members
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