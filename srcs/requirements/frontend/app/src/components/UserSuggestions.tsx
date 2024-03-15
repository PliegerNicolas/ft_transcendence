import { useContext } from "react";
import { MyContext } from "../utils/contexts";
import { useGet } from "../utils/hooks";
import { UserType } from "../utils/types";

export default function UserSuggestions()
{
	const { me } = useContext(MyContext);

	const getUsers = useGet(["users"]);

	return (
		<datalist id="UserSuggestions">
		{
			getUsers.isSuccess &&
			getUsers.data
				.filter((user: UserType) => user.id != me?.id)
				.map((user: UserType) => <option key={user.id} value={user.username} />)
		}
		</datalist>
	);
}