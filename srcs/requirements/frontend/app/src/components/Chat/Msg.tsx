import { Link } from "react-router-dom";
import { MsgType } from "../../utils/types.ts";

import "../../styles/chat.css";
import defaultPicture from "../../assets/default_profile.png"
import { useMutation } from "@tanstack/react-query";
import { useGet, useInvalidate, useMutateError } from "../../utils/hooks.ts";
import { useContext } from "react";
import { MyContext } from "../../utils/contexts.ts";

// <Msg /> =====================================================================

export default function Msg(
	{data, prev, next, size, role, popupFn}:
	{
		data: MsgType,
		prev: MsgType | null,
		next: MsgType | null,
		size: number,
		role: string,
		popupFn: Function
	}
)
{
	const { me } = useContext(MyContext)

	const date = fmtDate(data.createdAt);
	const member = data.channelMember;

	const getPic = useGet(["users", member.user.username ,"picture"]);

	const connectPrev =
		prev
		&& prev.channelMember.id === member.id
		&& fmtDate(prev.createdAt) === date;
	const connectNext =
		next
		&& next.channelMember.id === member.id
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
			${me && member.user.id == me.id && "me"}
			${connectPrev && "connectPrev"}
			${connectNext && "connectNext"}`
		}>
			<div className="Msg__PictureDiv">
				<Link to={"/user/" + member.user.username}>
					<img src={getPic.data || defaultPicture} />
				</Link>
			</div>
			<div>
			{
				<div className="Msg__Info">
					<Link
						to={"/user/" + member.user.username}
						className="Msg__Sender"
						style={{color: `hsl(${(360 / size) * (+member.id - 1)} 80% 80%)`}}
					>
						{member.user.username}
					</Link>
					•
					<span className="Msg__Date">
						{date}
					</span>
					{
						(role === "operator" || role === "owner") &&
						me && me.id !== member.user.id &&
						<ModActions msg={data} role={role} popupFn={popupFn}/>
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
	{msg, role, popupFn}:
	{msg: MsgType, role: string, popupFn: Function}
)
{
	const member = msg.channelMember;
	const username = member.user.username;

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
			<button
				className="ban"
				onClick={() => popupFn(
					<>Are you sure you want to ban {username} from this channel?</>,
					() => {action.mutate("ban")}
				)}
			>
				Ban
			</button>
			<button
				className="kick"
				onClick={() => popupFn(
					<>Are you sure you want to kick {username} from this channel?</>,
					() => {action.mutate("kick")}
				)}
			>
				Kick
			</button>
			<button
				className="mute"
				onClick={() => popupFn(
					<>Are you sure you want to mute {username} on this channel?</>,
					() => {action.mutate("mute")}
				)}
			>
				Mute
			</button>
			{
				role === "owner" && (
					member.role !== "operator" ?
					<button
						className="admin"
						onClick={() => popupFn(
							<>Are you sure you want to make {username} an admin on this channel?</>,
							() => {action.mutate("promote")}
						)}
					>
						Admin
					</button> :
					<button
						className="unadmin"
						onClick={() => popupFn(
							<>Are you sure you want to retrieve {username}'s admin privileges
							on this channel?</>,
							() => {action.mutate("demote")}
						)}
					>
						Unadmin
					</button>
				)
			}
		</div>
	);
}