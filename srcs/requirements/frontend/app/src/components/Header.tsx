import ft_logo from "../assets/42.svg";

function Header()
{
	return (
		<div className="Header">
			<div className="Header__Title">
				<img className="Header__Logo" src={ft_logo} />
				<span className="Header__TitleText">
					transcendence
				</span>
			</div>
			<span className="Header__Login">
				login
			</span>
		</div>
	);
}

export default Header;