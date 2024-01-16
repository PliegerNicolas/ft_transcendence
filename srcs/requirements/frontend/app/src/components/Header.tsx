import {Link} from "react-router-dom";

import "../styles/header.css";

import ft_logo from "../assets/42.svg";
import loginIcon from "../assets/login.svg";

function Header()
{
	const redirectLinkParams = new URLSearchParams({
		client_id: import.meta.env.VITE_FTAPI_CLIENTID,
		redirect_uri: `http://${location.host}/auth`,
		response_type: "code"
	});
	const redirectLink = "https://api.intra.42.fr/oauth/authorize?" + redirectLinkParams.toString();

	return (
		<header className="Header">
			<Link to="/">
				<div className="Header__Title">
					<img className="Header__Logo" src={ft_logo} />
					<span className="Header__TitleText">Pong</span>
				</div>
			</Link>
			<a
				href={redirectLink}
				onClick={() => localStorage.setItem("auth_redirect", location.pathname)}
				className="Header__Login"
			>
				Log In
				<img src={loginIcon} />
			</a>
		</header>
	);
}

export default Header;