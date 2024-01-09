import ft_logo from "../assets/42.svg";

function Header()
{
	return (
		<div className="Header">
			<div className="Header__Title">
				<img className="Header__Logo" src={ft_logo} />
				<span className="Header__TitleText">Trnscndnce</span>
			</div>
			<div className="Header__Login">
				<span className="Header__LoginText">Log in</span>
			</div>
		</div>
	);
}

export default Header;