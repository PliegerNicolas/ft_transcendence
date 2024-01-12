import {Link} from "react-router-dom";
import ft_logo from "../assets/42.svg";

function Header()
{
	return (
		<header className="Header">
			<Link to="/">
				<div className="Header__Title">
					<img className="Header__Logo" src={ft_logo} />
					<span className="Header__TitleText">Trnscndnce</span>
				</div>
			</Link>
			<div className="Header__Login">
				<span className="Header__LoginText">Log in</span>
			</div>
		</header>
	);
}

export default Header;