import { ChanType, FriendshipType, MemberType } from "./types";

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
	const member = chan.activeMembers.find((member) => member.user.id == id);

	if (!member)
		return ("");
	return (member.role);
}

export function isMuted(chan: ChanType, id: string)
{
	return (chan.mutedMembers.find((member) => member.user.id === id));
}

export function isBanned(chan: ChanType, id: string)
{
	return (chan.bannedMembers.find((member) => member.user.id === id));
}

export function isInvited(chan: ChanType, id: string)
{
	return (chan.invitedMembers.find((member) => member.user.id === id));
}

export function isAdmin(chan: ChanType, id: string)
{
	return (chan.activeMembers.find((member) =>
		member.user.id === id && member.role === "operator"));
}

export async function dynaGet(uri: string)
{
	//console.log("GET --> " + uri);
	const response = await fetch(uri, {
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		});
	if (!response.ok) {
		const error = await response.json();
		return (Promise.reject(error));
	}
	return (response.json());
}

export function extractShip(ship: FriendshipType)
{
	return {
		user1: ship.userStatuses[0].user,
		user2: ship.userStatuses[1].user,
		status1: ship.userStatuses[0].status,
		status2: ship.userStatuses[1].status,
	};
}

export function toOldShip(ship: FriendshipType)
{
	return {
		...ship,
		...extractShip(ship),
	};
}

export function muteDelay(member: MemberType | undefined)
{
	if (!member || !member.mutedSince || !member.muteDuration || !member.muted)
		return (0);

	const start = new Date(member.mutedSince);
	const now = new Date();

	const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
	const remaining = +member.muteDuration - elapsed;

	return (remaining);
}