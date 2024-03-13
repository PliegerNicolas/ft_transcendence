import { useQueryClient, QueryKey, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { MyContext } from "./contexts";
import { httpStatus } from "./utils";

export function useInvalidate()
{
	const queryClient = useQueryClient();

	return ((key: QueryKey) => queryClient.invalidateQueries({queryKey: key}))
}

export function useStopOnHttp()
{
	const {setLogInfo} = useContext(MyContext);

	return ((count: number, error: Error) => {
		const status = httpStatus(error);

		if (status === 401) {
			localStorage.removeItem("my_info");
			setLogInfo({logged: false, token: ""});
		}

		return (!status && count < 3)
	});
}

export function useMutateError()
{
	const {addNotif} = useContext(MyContext);

	return ((error: Error) => {
		const status = httpStatus(error);

		addNotif({content: error.message});
		if (status === 401) {
			addNotif({content: `401 == USER NOT LOGGED,
				SHOULD A 401 TRULY BE RETURNED IN THIS CASE?`});
			addNotif({content: `403 is the prefered way of signaling an
				authenticated user isn't allowed to access a resource.`});
		}
	})
}

export function useGet(key: QueryKey, enabled = true)
{
	const {api} = useContext(MyContext);
	const path = "/" + key.join("/");
	const stopOnHttp = useStopOnHttp();

	return (useQuery({
		queryKey: key,
		queryFn: () => api.get(path),
		retry: stopOnHttp,
//		staleTime: 5000,
		enabled,
	}));
}