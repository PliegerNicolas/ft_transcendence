import { useEffect, useState } from "react";

import closeIcon from "../assets/close.svg";

/*
** This component is one big chunk of spaghetti shit.
**
** Don't look too much into it, please.
*/

export default function Notifs(
	{list, setList}:
	{list: {type: number, content: string, date: number}[], setList: Function}
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
				<div key={notif.date} style={{
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
	{notif: {type: number, content: string, date: number}, rmSelf: Function}
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
			className={`Notifs__Notif ${!notif.type && "err"} ${fade && "fadeout"}`}
			onClick={() => rmSelf()}
		>
			<div>
				<div className="Notif__Date">
					{pad(date.getHours())}:{pad(date.getMinutes())}
				</div>
				{notif.content}
			</div>
			<button><img src={closeIcon} /></button>
		</div>
		);
}