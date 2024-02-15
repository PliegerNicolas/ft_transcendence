import { useQueryClient, QueryKey } from "@tanstack/react-query";


export function useInvalidate()
{
	const queryClient = useQueryClient();

	return ((key: QueryKey) => queryClient.invalidateQueries({queryKey: key}))
}

export function httpStatus(s: string)
{
	const statusString = s.substring(0, 4);
	if (isNaN(+statusString) || isNaN(parseFloat(statusString)))
		return (0);
	return (+statusString);
}

export function stopOnHttp(count: number, error: Error)
{
	return (!httpStatus(error.message) && count < 3)
}