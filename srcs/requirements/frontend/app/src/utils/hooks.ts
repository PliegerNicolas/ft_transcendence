import { useQueryClient, QueryKey, useQuery, useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { MyContext } from "./contexts";
import { httpStatus } from "./utils";
import { useNavigate } from "react-router";

export function useInvalidate()
{
	const queryClient = useQueryClient();

	return ((key: QueryKey) => queryClient.invalidateQueries({queryKey: key}))
}

export function useStopOnHttp()
{
	const { setLogged, api } = useContext(MyContext);

	const refresh = useMutation({
		mutationFn: () => api.get("/auth/refresh"),
		onError: () => setLogged(false)
	});

	return ((count: number, error: Error) => {
		const status = httpStatus(error);

		if (status === 401) {
			refresh.mutate();
			return (count < 2);
		}
		else
			return (!status && count < 3)
	});
}

export function useRetryMutate()
{
	const { setLogged, api } = useContext(MyContext);

	const refresh = useMutation({
		mutationFn: () => api.get("/auth/refresh"),
		onError: () => setLogged(false)
	});

	return (count: number, err: Error) => {
		if (httpStatus(err) !== 401)
			return (false);

		refresh.mutate();
		return (count < 2);
	}
}

export function useMutateError()
{
	const { addNotif } = useContext(MyContext);

	return ((error: Error) => {
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
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: ((name: string) => api.post("/auth/log_as/" + name, {})),
		onSuccess: () => {navigate("/"); window.location.reload()},
		onError: mutateError,
	});

	return ((name: string) => mutation.mutate(name));
}

export function useDmName()
{
	const {me} = useContext(MyContext);

	return (name: string) => {
		if (name.slice(0, 4) !== "MP: ")
			return ("");
		const array = name.slice(4).split(", ");
		if (array[0] === me!.username)
			return ("@" + array[1]);
		return ("@" + array[0]);
	}
}