import { Link } from "react-router-dom";
import { MsgType } from "../../utils/types.ts";

import "../../styles/chat.css";
import defaultPicture from "../../assets/default_profile.png"
import { useGet, useSetMe } from "../../utils/hooks.ts";
import { useContext } from "react";
import { MyContext } from "../../utils/contexts.ts";
import ChanUsername from "./ChanUsername.tsx";
import ModActions from "./ModActions.tsx";
import { InvitePlayer } from "../Game/Invitations.tsx";

// <Msg /> =====================================================================

export default function Msg(
	{data, prev, next, popupFn}:
	{data: MsgType, prev: MsgType | null, next: MsgType | null, popupFn: Function}
)
{
	const { me } = useContext(MyContext)
	const setMe = useSetMe();

	const date = fmtDate(data.createdAt);
	const member = data.channelMember;
	const user = member.user;

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
		if (a.getDate() !== b.getDate()) return (false);
		if (a.getMonth() !== b.getMonth()) return (false);
		if (a.getFullYear() !== b.getFullYear()) return (false);
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
					<ChanUsername member={member} />
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
					<ModActions member={member} popupFn={popupFn}/>
					{
						user.id != me!.id &&
						<button className="Msg__LogAs" onClick={() => setMe(user.username)}>
							Log as
						</button>
					}
					<InvitePlayer user={user.username} />
				</div>
			}
				{data.content}
			</div>
		</div>
	);
}