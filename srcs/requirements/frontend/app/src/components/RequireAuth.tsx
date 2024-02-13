import { useContext } from "react";
import { MyContext } from "../utils/contexts";

export default function RequireAuth({elem}: {elem: JSX.Element})
{
	const {logged} = useContext(MyContext);

	if (!logged) return (
		<main className="MainContent">
			<span className="error-msg">
				You need to be logged to access this page!
			</span>
		</main>
	);

	return (elem);
}