import { useContext } from "react";
import { MyContext } from "../utils/contexts.ts";

import Login from "./Login.tsx"

export default function RequireAuth({elem}: {elem: JSX.Element})
{
	const { me } = useContext(MyContext)

	if (!me) return (
		<main className="MainContent RequireAuth">
			<span>
				You need to be logged in to access this page.
			</span>
			<Login />
		</main>
	);

	return (elem);
}