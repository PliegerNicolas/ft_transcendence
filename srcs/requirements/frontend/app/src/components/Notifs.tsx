import { useEffect, useState } from "react";
import { NotifType } from "../utils/types";

import closeIcon from "../assets/close.svg";

export default function Notifs(
	{list, setList}:
	{list: NotifType[], setList: Function}
)
{
	function rmNotif(date: number) {
		setList((prev: {type: number, content: string, date: number}[]) =>
			prev.filter(notif => notif.date !== date));
	}

	return (
		<div className="Notifs">
		{
			list.map((notif, index) =>
				<div key={notif.id} style={{
					opacity: "" + (1 - .33 * ((list.length - 3) - index)),
					display: (index < list.length - 5) ? "none" : "auto"
				}}>
				<Notif
					notif={notif}
					rmSelf={() => rmNotif(notif.date)}
				/>
				</div>
			)
		}
		</div>
	);
}

function Notif(
	{notif, rmSelf}:
	{notif: NotifType, rmSelf: Function}
)
{
	const [fade, setFade] = useState(false);
	const delta = 6000 + (notif.date - Date.now());
	const date = new Date(notif.date);

	useEffect(() => {
		const fadeTO = setTimeout(() => setFade(true), delta);
		const rmTO = setTimeout(rmSelf, delta + 2000);

		return (() => {
			clearTimeout(fadeTO);
			clearTimeout(rmTO);
		});
	}, []);

	function pad(n: number) {
		return ("" + String(n).padStart(2, "0"));
	}

	return (
		<div
			className={`Notif ${!notif.type && "err"} ${fade && "fadeout"}`}
			onClick={() => rmSelf()}
		>
			<div className="Notif__Top">
				<div className="Notif__Date">
					{pad(date.getHours())}:{pad(date.getMinutes())}
				</div>
				<button><img src={closeIcon} /></button>
			</div>
			<div>
				{notif.content}
			</div>
		</div>
		);
}