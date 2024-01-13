import {Link} from "react-router-dom";
import ft_logo from "../assets/42.svg";

function Header()
{
	const redirectLinkParams = new URLSearchParams({
		client_id: "u-s4t2ud-9a9cee22edb9c564d3166746c9bf18b72bd6b36cf73c9ab06d6120c44d63c0ff",
		redirect_uri: `http://${location.hostname}:3030/auth`,
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