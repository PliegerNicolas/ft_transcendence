import { useQueryClient, QueryKey, useQuery, useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { MyContext } from "./contexts";
import { extractShip, httpStatus } from "./utils";
import { ChanType, FriendshipType } from "./types";
import { socket } from "../App";

export function useInvalidate()
{
	const queryClient = useQueryClient();

	return ((key: QueryKey) => queryClient.invalidateQueries({queryKey: key}))
}

export function useStopOnHttp()
{
	const { setLogged } = useContext(MyContext);

	/*
	const refresh = useMutation({
		mutationFn: () => api.get("/auth/refresh"),
		onError: () => setLogged(false)
	});*/

	return ((count: number, error: Error) => {
		const status = httpStatus(error);

		if (status === 401)
			setLogged(false);

		return (!status && count < 3)
	});
}

export function useRetryMutate()
{
	/*const { setLogged, api } = useContext(MyContext);

	const refresh = useMutation({
		mutationFn: () => api.get("/auth/refresh"),
		onError: () => setLogged(false)
	});*/

	return (/*count: number, err: Error*/) => {
		return (false);
	/*
		if (httpStatus(err) !== 401)
			return (false);

		refresh.mutate();
		return (count < 2);
	*/
	}
}

export function useMutateError()
{
	const { addNotif } = useContext(MyContext);

	return ((error: Error) => {
		if (httpStatus(error) !== 500)
			addNotif({content: error.message});
	})
}

export function useGet(key: QueryKey, enabled = true)
{
	const { api } = useContext(MyContext);
	const path = "/" + key.join("/");
	const stopOnHttp = useStopOnHttp();

	return (useQuery({
		queryKey: key,
		queryFn: () => api.get(path),
		retry: stopOnHttp,
		staleTime: 200,
		enabled,
	}));
}

export function useSetMe()
{
	const { api } = useContext(MyContext);
	const mutateError = useMutateError();

	async function emitUserInfos() {
		const res = await api.get("/me");

		socket.emit('userInfos', res.username);
	}

	const mutation = useMutation({
		mutationFn: ((name: string) => api.post("/auth/log_as/" + name, {})),
		onSuccess: () => {
			emitUserInfos();
			window.location.reload()
		},
		onError: mutateError,
	});

	return ((name: string) => mutation.mutate(name));
}

export function useDmName()
{
	const { me } = useContext(MyContext);

	return (chan: ChanType) => {
		if (chan.mode !== "private")
			return ("");

		if (!chan.activeMembers || !chan.inactiveMembers)
			return ("");

		//TODO move to a method based on invited, which require backend modifs.
		const members = chan.activeMembers.concat(chan.inactiveMembers);
		if (members.length !== 2)
			return ("");

		if (members[0].user.id === me!.id)
			return (members[1].user.username);
		return (members[0].user.username);
	}
}

export function useRelation(username: string)
{
	const { me } = useContext(MyContext);

	const exit = username === me?.username || !username

	const getRelations = useGet(["relationships"], !exit);
	const getUser = useGet(["users", username], !exit);

	if (exit)
		return ("none");

	if (!getRelations.isSuccess || !getUser.isSuccess)
		return ("");

	const match = getRelations.data.find((ship: FriendshipType) =>
		ship.userStatuses[0].user.id == getUser.data.id
		|| ship.userStatuses[1].user.id == getUser.data.id);

	if (!match)
		return ("none");

	const {user1, status1, status2} = extractShip(match);

	if (status1 == "accepted" && status2 == "accepted")
		return ("accepted");

	const myStatus = user1.id == me?.id ? status1 : status2;
	const theirStatus = user1.id == me?.id ? status2 : status1;

	if (theirStatus == "blocked")
		return ("imblocked");
	if (myStatus == "blocked")
		return ("blocked");
	if (myStatus == "pending")
		return ("approve");
	if (theirStatus == "pending")
		return ("pending");
	return ("none");
}