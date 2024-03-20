import { useContext } from "react";
import { useLocation, Link } from "react-router-dom";

import Spinner from "../Spinner.tsx";

import { useDmName, useGet } from "../../utils/hooks.ts";
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

	const dmName = useDmName();

	console.log(getChans.data);

	if (getChans.isPending) return (
		<div className={
			`ChatSidebar ${showSidebar < 0 && "collapse"} ${showSidebar > 1 && "expand"}`
		}>
			<h3 className="ChatSidebar__Title">
				Your channels
				<Link to="new" className="ChatSidebar__Add">
					<img src={add} />
				</Link>
			</h3>
			<Spinner />
		</div>
	);

	if (getChans.isError) return (
		<div className={
			`ChatSidebar ${showSidebar < 0 && "collapse"} ${showSidebar > 1 && "expand"}`
		}>
			<h3 className="ChatSidebar__Title">
				Your channels
				<Link to="new" className="ChatSidebar__Add">
					<img src={add} />
				</Link>
			</h3>
			<div className="error-msg" style={{ marginLeft: "25px" }}>
				{getChans.error.message}
			</div>
		</div>
	);

	const chans = getChans.data;

	const dmChans =
		chans.filter((chan: ChanSpecsType) => dmName(chan.channel.name));
	const memberChans =
		chans.filter((chan: ChanSpecsType) => chan.isMember && !dmName(chan.channel.name));
	const allChans =
		chans.filter((chan: ChanSpecsType) => !chan.isMember && !dmName(chan.channel.name))

	return (
		<div className={
			`ChatSidebar ${showSidebar < 0 && "collapse"} ${showSidebar > 1 && "expand"}`
		}>
			<h3 className="ChatSidebar__Title first">
				Chat
				<Link to="new" className="ChatSidebar__Add">
					<img src={add} />
				</Link>
			</h3>
			{
				!!dmChans.length &&
				<ChanList id={id} isDm={true} chans={dmChans} title="Your DMs:"/>
			}
			{
				!!memberChans.length &&
				<ChanList id={id} isDm={false} chans={memberChans} title="Your channels:" />
			}
			{
				!!allChans.length &&
				<ChanList id={id} isDm={false} chans={allChans} title="All channels:" />
			}
		</div>
	);
}

function ChanList(
	{chans, id, isDm, title}:
	{chans: ChanSpecsType[], id: string, isDm: boolean, title: string}
)
{
	return (
		<div className="Chat__Chanlist">
			{
				title !== "Your DMs:" && <hr />
			}
			<h4 className="ChatSidebar__Title">{title}</h4>
			{
				chans.map((chan: ChanSpecsType) =>
					<ChanListItem key={chan.channel.id} isDm={isDm} chan={chan} id={id} />)
			}
		</div>
	);
}

function ChanListItem(
	{chan, id, isDm}:
	{chan: ChanSpecsType, id: string, isDm: boolean})
{
	const getDmName = useDmName();
	const dmName = getDmName(chan.channel.name);
	const username = dmName ? dmName.slice(1): "";

	const getPic = useGet(["users", username, "picture"], isDm);
	console.log("USERNAME:  " + username + "  " + isDm);

	return (
		<Link
			to={"" + chan.channel.id}
			className={
				`Chat__ChanListItem ${id == chan.channel.id && "curr"} ${isDm && "dm"}`}
		>
			{
				getPic.isSuccess && isDm &&
				<img src={getPic.data} />
			}
			<div className="Chat__ChanListItemName">
				{dmName ? dmName : chan.channel.name}
			</div>
			{
				!dmName &&
				<div className="Chat__ChanListItemSize">
					{chan.channel.membersCount} members
				</div>
			}
		</Link>
	);
}