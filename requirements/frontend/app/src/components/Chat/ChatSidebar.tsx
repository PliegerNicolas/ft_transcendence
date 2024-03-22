import { useContext, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

import Spinner from "../Spinner.tsx";

import { useDmName, useGet, useInvalidate } from "../../utils/hooks.ts";
import { ChatContext } from "../../utils/contexts.ts";

import add from "../../assets/add.svg";

import "../../styles/chat.css";
import { ChanSpecsType } from "../../utils/types.ts";

import { socket } from "../../App.tsx"

// <ChatSidebar /> =============================================================

export default function ChatSidebar() {
	const loc = useLocation();
	const invalidate = useInvalidate();
	const idArray = loc.pathname.match(/\/[^/]*$/);
	const id = idArray?.length ? idArray[0].slice(1) : "";

	const { showSidebar } = useContext(ChatContext);

	const getChans = useGet(["channels"]);

	useEffect(() => {
		socket.on('refreshChannels', () => {
			invalidate(["channels"]);
		});
		return (() => {socket.off('refreshChannels')});
	}, []);

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
		chans.filter((chan: ChanSpecsType) => chan.channel.mode === "private");
	const memberChans =
		chans.filter((chan: ChanSpecsType) => chan.isMember && chan.channel.mode !== "private");
	const allChans =
		chans.filter((chan: ChanSpecsType) => !chan.isMember && chan.channel.mode !== "private")

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
				<ChanList id={id} chans={dmChans} title="Your DMs:"/>
			}
			{
				!!memberChans.length &&
				<ChanList id={id} chans={memberChans} title="Your channels:" />
			}
			{
				!!allChans.length &&
				<ChanList id={id} chans={allChans} title="All channels:" />
			}
		</div>
	);
}

function ChanList(
	{chans, id, title}:
	{chans: ChanSpecsType[], id: string, title: string}
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
					<ChanListItem key={chan.channel.id} chan={chan} id={id} />)
			}
		</div>
	);
}

function ChanListItem(
	{chan, id}:
	{chan: ChanSpecsType, id: string})
{
	const dmName = useDmName();

	const isDm = chan.channel.mode === "private";

	const getChan = useGet(["channels", chan.channel.id], isDm);
	const username = getChan.isSuccess ? dmName(getChan.data.channel) : "";
	const getPic = useGet(["users", username, "picture"], !!username);

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
				{username ? "@"+username : chan.channel.name}
			</div>
			{
				!isDm &&
				<div className="Chat__ChanListItemSize">
					{chan.channel.membersCount} members
				</div>
			}
		</Link>
	);
}