import {Link} from "react-router-dom";
import ft_logo from "../assets/42.svg";

function Header()
{
	const redirectLinkParams = new URLSearchParams({
		client_id: "u-s4t2ud-6a30fe66352f0b35cfb0b9450bd1d47869dbcbe39ecb4f8fe01a3a95cb633809",
		redirect_uri: `http://${location.hostname}:3030/`,
		response_type: "code"
	});
	const redirectLink = "https://api.intra.42.fr/oauth/authorize?" + redirectLinkParams.toString();

	return (
		<header className="Header">
			<Link to="/">
				<div className="Header__Title">
					<img className="Header__Logo" src={ft_logo} />
					<span className="Header__TitleText">PONG</span>
				</div>
			</Link>
			<a href={redirectLink} className="Header__Login">
				Log In
			</a>
		</header>
	);
}

export default Header;