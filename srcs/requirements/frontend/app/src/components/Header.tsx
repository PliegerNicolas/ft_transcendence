import { Link } from "react-router-dom";
import { MyContext } from "../utils/contexts";

import { useContext } from "react";

import "../styles/header.css";

import ft_logo from "../assets/42.svg";
import check from "../assets/check.svg";
import loginIcon from "../assets/login.svg";

function Header()
{
	const redirectLinkParams = new URLSearchParams({
		client_id: import.meta.env.VITE_FTAPI_CLIENTID,
		redirect_uri: `http://${location.host}/auth`,
		response_type: "code"
	});
	const redirectLink
		= "https://api.intra.42.fr/oauth/authorize?"
		+ redirectLinkParams.toString();
	const myInfo = useContext(MyContext);

	return (
		<header className="Header">
			<Link to="/">
				<div className="Header__Title">
					<img className="Header__Logo" src={ft_logo} />
					<span className="Header__TitleText">Pong</span>
				</div>
			</Link>
			{
				myInfo.logged ?
				<a
					href={redirectLink}
					onClick={() => localStorage.setItem("auth_redirect", location.pathname)}
					className="Header__Login"
				>
					Logged In
					<img src={check} />
				</a> :
				<a
					href={redirectLink}
					onClick={() => localStorage.setItem("auth_redirect", location.pathname)}
					className="Header__Login"
				>
					Log In
					<img src={loginIcon} />
				</a>
			}
		</header>
	);
}

export default Header;