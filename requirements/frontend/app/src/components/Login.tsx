import { useContext } from "react";
import { MyContext } from "../utils/contexts";

import check from "../assets/check.svg";
import loginIcon from "../assets/login.svg";

export default function Login()
{
	const { logged } = useContext(MyContext);
	const redirectLinkParams = new URLSearchParams({
		client_id: import.meta.env.VITE_FTAPI_CLIENTID,
		redirect_uri: `https://${location.host}/auth`,
		response_type: "code"
	});

	const redirectLink
		= "https://api.intra.42.fr/oauth/authorize?"
		+ redirectLinkParams.toString();

	if (logged) return (
		<div className="Login">
			Logged In
			<img src={check} />
		</div>
	);

	return (
		<a
			href={redirectLink}
			onClick={() => localStorage.setItem("auth_redirect", location.pathname)}
			className="Login"
		>
			Log In
			<img src={loginIcon} />
		</a>
	);
}