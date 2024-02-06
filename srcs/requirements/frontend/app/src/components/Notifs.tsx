import { useEffect } from "react";

/*
** This component is one big chunk of spaghetti shit.
**
** Don't look too much into it, please.
*/

export default function Notifs(
	{list, setList}:
	{list: {type: number, content: string}[], setList: Function}
)
{
	useEffect(() => {
		if (!list.length)
			return ;

		const fadeTimeout = setTimeout(() => {
			setList((prev: any) => prev.map((item: any, index: any) =>
				index ? item : {content: item.content, type: item.type + 2}
			));
			setTimeout(() => setList((prev: any) => prev.slice(1)), 1000);
		}, 1000);

		return (() => clearTimeout(fadeTimeout));
	}, [list]);

	return (
		<div className="Notifs">
		{
			list.map((notif, index) => 
				<div
					key={index}
					className={`Notifs__Notif ${!(notif.type % 2) && "err"} ${notif.type > 2 && "rm"}`}
					onClick={
						() => setList((prev: any) =>
							prev.filter((item: any, i: any) => item && i != index))
					}
				>
					{notif.content}
				</div>
			)
		}
		</div>
	);
}