import { useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Spinner from "../Spinner.tsx";

import { ChatContext, MyContext } from "../../utils/contexts.ts";

import add from "../../assets/add.svg";

import "../../styles/chat.css";

// <ChatSidebar /> =============================================================

export default function ChatSidebar()
{
	const loc = useLocation();
	const idArray = loc.pathname.match(/\/[^/]*$/);
	const id = idArray?.length ? idArray[0].slice(1) : 0;

	const { showSidebar } = useContext(ChatContext);

	const context = useContext(MyContext);

	const getChans = useQuery({
		queryKey: ["allChans"],
		queryFn: () => context.api.get("/channels")
	});

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
						getChans.data.map((chan : {id: string, name: string}) =>
							<Link
								to={chan.id}
								className={`Chat__ChanListItem ${id === chan.id && "curr"}`}
								key={chan.id}
							>
								<div className="Chat__ChanListItemName">{chan.name}</div>
								<div className="Chat__ChanListItemSize">?? members</div>
							</Link>)
					}
					</div>
				|| getChans.isPending &&
					<Spinner />
				|| getChans.isError &&
					<div className="error-msg" style={{marginLeft: "25px"}}>
						{getChans.error.message}
					</div>
			}
		</div>
	);
}