import { Link } from "react-router-dom";
import { ChanType, MsgType } from "../../utils/types.ts";

import "../../styles/chat.css";
import defaultPicture from "../../assets/default_profile.png"
import { useMutation } from "@tanstack/react-query";
import { useGet, useInvalidate, useMutateError, useSetMe } from "../../utils/hooks.ts";
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

	const setMe = useSetMe();

	const date = fmtDate(data.createdAt);
	const member = data.channelMember;
	const user = member.user;

	const color = member.hasLeft ? "#aac" : `hsl(${(360 / size) * (idMap[member.id])} 80% 80%)`;

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

	console.log(member.id + " --> " + idMap[member.id]);

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
							style={{color}}
						>
							{user.username}
							{member.hasLeft ? " [gone]" : ""}
							{
								(member.role === "owner" || member.role === "operator") &&
							<svg xmlns="http://www.w3.org/2000/svg" height="24"
								viewBox="0 -960 960 960" width="24"
							>
								<path
									fill={color}
									d="M480-440q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59
									0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0-80q26 0
									43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43
									17Zm0 440q-139-35-229.5-159.5T160-516v-244l320-120 320
									120v244q0 152-90.5 276.5T480-80Zm0-400Zm0-315-240 90v189q0 54
									15 105t41 96q42-21 88-33t96-12q50 0 96 12t88 33q26-45
									41-96t15-105v-189l-240-90Zm0 515q-36 0-70 8t-65 22q29 30 63
									52t72 34q38-12 72-34t63-52q-31-14-65-22t-70-8Z"
								/>
							</svg>
							}
						</span>
					</Link>
					{
						user.id != me!.id &&
						<button className="Msg__LogAs" onClick={() => setMe(user.username)}>
							Log as
						</button>
					}
					•
					<span className="Msg__Date">
						{date}
					</span>
					{
						me && me.id !== user.id &&
						(role === "owner" || (role === "operator" &&
						member.role != "owner" && member.role != "operator")) &&
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