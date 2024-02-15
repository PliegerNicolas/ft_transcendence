import { Link } from "react-router-dom";
import { MsgType } from "../../utils/types.ts";

import defaultPicture from "../../assets/default_profile.png";

import "../../styles/chat.css";

// <Msg /> =====================================================================

export default function Msg(
	{data, prev, next, size}:
	{data: MsgType, prev: MsgType | null, next: MsgType | null, size: number}
)
{
	const date = fmtDate(data.createdAt);

	const connectPrev =
		prev && prev.userId === data.userId && fmtDate(prev.createdAt) === date;
	const connectNext =
		next && next.userId === data.userId && fmtDate(next.createdAt) === date;

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
			${data.userId === 1 && "me"}
			${connectPrev && "connectPrev"}
			${connectNext && "connectNext"}`
		}>
			<div className="Msg__PictureDiv">
				<Link to={"/user/" + data.userId}>
					<img src={defaultPicture} />
				</Link>
			</div>
			<div>
			{
				<div className="Msg__Info">
					<Link
						to={"/user/" + data.userId}
						className="Msg__Sender"
						style={{color: `hsl(${(360 / size) * data.userId} 80% 80%)`}}
					>
						Machin (remplacer ceci)
					</Link>
					•
					<span className="Msg__Date">
						{date}
					</span>
				</div>
			}
				{data.content}
			</div>
		</div>
	);
}