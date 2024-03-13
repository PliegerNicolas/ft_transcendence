import { Link } from "react-router-dom";
import { ChanType, MsgType } from "../../utils/types.ts";

import "../../styles/chat.css";
import defaultPicture from "../../assets/default_profile.png"
import { useMutation } from "@tanstack/react-query";
import { useGet, useInvalidate, useMutateError } from "../../utils/hooks.ts";
import { useContext } from "react";
import { MyContext } from "../../utils/contexts.ts";
import { getChanRole, isAdmin, isBanned, isMuted } from "../../utils/utils.ts";

// <Msg /> =====================================================================

export default function Msg(
	{data, prev, next, size, role, chan, idMap, popupFn}:
	{
		data: MsgType,
		prev: MsgType | null,
		next: MsgType | null,
		size: number,
		role: string,
		chan: ChanType,
		idMap: {[memberId: string]: number},
		popupFn: Function
	}
)
{
	const { me } = useContext(MyContext)

	const date = fmtDate(data.createdAt);
	const user = data.channelMember.user;

	const getPic = useGet(["users", user.username ,"picture"]);

	const connectPrev =
		prev
		&& prev.channelMember.id === data.channelMember.id
		&& fmtDate(prev.createdAt) === date;
	const connectNext =
		next
		&& next.channelMember.id === data.channelMember.id
		&& fmtDate(next.createdAt) === date;

	function sameDate(a: Date, b: Date) {
		if (a.getDate() !== b.getDate())
			return (false);
		if (a.getMonth() !== b.getMonth())
			return (false);
		if (a.getFullYear() !== b.getFullYear())
			return (false);
		return (true);
	}

	function fmtDate(createdAt: string) {
		const date = new Date(createdAt);
		const now = new Date();

		return (
			sameDate(date, now) ?
				pad(date.getHours()) + ":" + pad(date.getMinutes()) :
				pad(date.getDate()) + "/" + pad(date.getMonth() + 1) + "/"
				+ date.getFullYear() + " at " + pad(date.getHours()) + ":"
				+ pad(date.getMinutes())
		);
	}

	function pad(n: number) {
		return ("" + String(n).padStart(2, "0"));
	}

	return (
		<div className={
			`Msg
			${me && user.id == me.id && "me"}
			${connectPrev && "connectPrev"}
			${connectNext && "connectNext"}`
		}>
			<div className="Msg__PictureDiv">
				<Link to={"/user/" + user.username}>
					<img src={getPic.data || defaultPicture} />
				</Link>
			</div>
			<div>
			{
				<div className="Msg__Info">
					<Link
						to={"/user/" + user.username}
					>
						<span
							className="Msg__Sender"
							style={
								idMap[user.id] !== undefined ?
								{color: `hsl(${(360 / size) * (idMap[user.id])} 80% 80%)`} :
								{color: "#aac"}
							}
						>
							{user.username}
							{idMap[user.id] === undefined ? " [left]" : ""}
						</span>
					</Link>
					•
					<span className="Msg__Date">
						{date}
					</span>
					{
						(role === "operator" || role === "owner") &&
						me && me.id !== user.id &&
						getChanRole(chan, user.id) != "owner" &&
						<ModActions msg={data} role={role} chan={chan} popupFn={popupFn}/>
					}
				</div>
			}
				{data.content}
			</div>
		</div>
	);
}

// <ModActions /> ==============================================================

function ModActions(
	{msg, role, chan, popupFn}:
	{msg: MsgType, role: string, chan: ChanType, popupFn: Function}
)
{
	const user = msg.channelMember.user;
	const username = user.username;

	const { api } = useContext(MyContext);
	const mutateError = useMutateError();
	const invalidate = useInvalidate();

	const action = useMutation({
		mutationFn: (action: string) =>
			api.patch(
				"/channels/" + msg.channelId + "/manage_access",
				{action, usernames: [username]}
			),
		onError: mutateError,
		onSuccess: () => invalidate(["channels", msg.channelId]),
	});

	return (
		<div className="Msg__ModActions">
			{
				isBanned(chan, user.id) ?
				<button
					className="ban"
					onClick={() => popupFn(
						<>Are you sure you want to unban {username} from this channel?</>,
						() => {action.mutate("deban")}
					)}
				>
					Unban
				</button> :
				<button
					className="ban"
					onClick={() => popupFn(
						<>Are you sure you want to ban {username} from this channel?</>,
						() => {action.mutate("ban")}
					)}
				>
					Ban
				</button>
			}
			{
				getChanRole(chan, user.id) &&
				<button
					className="kick"
					onClick={() => popupFn(
						<>Are you sure you want to kick {username} from this channel?</>,
						() => {action.mutate("kick")}
					)}
				>
					Kick
				</button>
			}
			{
				isMuted(chan, user.id) ?
				<button
					className="mute"
					onClick={() => popupFn(
						<>Are you sure you want to unmute {username} on this channel?</>,
						() => {action.mutate("unmute")}
					)}
				>
					Unmute
				</button> :
				<button
					className="mute"
					onClick={() => popupFn(
						<>Are you sure you want to mute {username} on this channel?</>,
						() => {action.mutate("mute")}
					)}
				>
					Mute
				</button>
			}
			{
				role === "owner" && getChanRole(chan, user.id) && (
					isAdmin(chan, user.id) ?
					<button
						className="unadmin"
						onClick={() => popupFn(
							<>Are you sure you want to retrieve {username}'s admin privileges
							on this channel?</>,
							() => {action.mutate("demote")}
						)}
					>
						Unadmin
					</button> :
					<button
						className="admin"
						onClick={() => popupFn(
							<>Are you sure you want to make {username} an admin on this channel?</>,
							() => {action.mutate("promote")}
						)}
					>
						Admin
					</button>
				)
			}
		</div>
	);
}