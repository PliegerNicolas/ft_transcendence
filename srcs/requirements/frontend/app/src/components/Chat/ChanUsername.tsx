import { Link } from "react-router-dom";
import { MemberType } from "../../utils/types";
import { useContext } from "react";
import { ChatContentContext } from "../../utils/contexts";

export default function ChanUsername(
	{member}:
	{member: MemberType}
)
{
	const { chan, idMap } = useContext(ChatContentContext);

	const user = member.user;
	const color = !member.active ? "#aac" :
		`hsl(${(360 / chan.membersCount) * (idMap[member.id])} 80% 80%)`;

	return (
		<Link
			to={"/user/" + user.username}
		>
			<span
				className="Msg__Sender"
				style={{color}}
			>
				{user.username}
				{!member.active ? " [gone]" : ""}
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
	);
}