import {Link} from "react-router-dom";

import "../styles/header.css";

import ft_logo from "../assets/42.svg";
import check from "../assets/check.svg";
import loginIcon from "../assets/login.svg";

import { MyInfoType } from "../utils/types";

function Header(props: {myInfo: MyInfoType})
{
	const redirectLinkParams = new URLSearchParams({
		client_id: import.meta.env.VITE_FTAPI_CLIENTID,
		redirect_uri: `http://${location.host}/auth`,
		response_type: "code"
	});
	const redirectLink
		= "https://api.intra.42.fr/oauth/authorize?"
		+ redirectLinkParams.toString();

	return (
		<header className="Header">
			<Link to="/">
				<div className="Header__Title">
					<img className="Header__Logo" src={ft_logo} />
					<span className="Header__TitleText">Pong</span>
				</div>
			</Link>
			{
				props.myInfo.logged ?
				<div className="Header__Login">
					Logged In
					<img src={check} />
				</div> :
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