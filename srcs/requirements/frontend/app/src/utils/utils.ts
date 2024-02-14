import { useQueryClient, QueryKey } from "@tanstack/react-query";


export function useInvalidate()
{
	const queryClient = useQueryClient();

	return ((key: QueryKey) => queryClient.invalidateQueries({queryKey: key}))
}