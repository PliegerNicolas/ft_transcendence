import { ChanType } from "./types";

export function httpStatus(e: Error)
{
	const statusString = e.message.substring(0, 4);
	if (isNaN(+statusString) || isNaN(parseFloat(statusString)))
		return (0);
	return (+statusString);
}

export function randomString(length: number)
{
	const charset = "aaabcdeeeefghiiijklmnooopqrstuuuvwxyz";
	let ret = "";

	for (let i = 0; i < length; ++i) {
		ret += charset[Math.floor(36 * Math.random())];
	}
	return (ret);
}

export function getChanRole(chan: ChanType, id: string)
{
	const member = chan.members.find(item => item.user.id == id);

	if (!member)
		return ("");
	return (member.role);
}

export async function dynaGet(uri: string, token: string)
{
	console.log("GET --> " + uri);
	const response = await fetch(uri, {
		headers: {
			"Content-Type": "application/json",
			"Authorization": token},
		credentials: "include",
		});
	if (!response.ok)
		return (Promise.reject(new Error(response.status + " " + response.statusText)));
	return (response.json());
}