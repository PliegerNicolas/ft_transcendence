import { useQueryClient, QueryKey } from "@tanstack/react-query";


export function useInvalidate()
{
	const queryClient = useQueryClient();

	return ((key: QueryKey) => queryClient.invalidateQueries({queryKey: key}))
}

export function httpStatus(e: Error)
{
	const statusString = e.message.substring(0, 4);
	if (isNaN(+statusString) || isNaN(parseFloat(statusString)))
		return (0);
	return (+statusString);
}

export function stopOnHttp(count: number, error: Error)
{
	return (!httpStatus(error) && count < 3)
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