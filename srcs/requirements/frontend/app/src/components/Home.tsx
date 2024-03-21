import chat1 from "../assets/chat1.jpeg";
import chat2 from "../assets/chat2.jpeg";
import chat3 from "../assets/chat3.jpeg";
import chat4 from "../assets/chat4.jpeg";

import "../styles/home.css";

function Home()
{
	return (
		<main className="MainContent">
			<div className="Home__Title">
				<h2>This site has been made by</h2>
			</div>
			<div className="Home__Content">
				<div className="Home__Name">
        			<img src={chat1} alt="Nicolas"/>
        			<div>Nicolas "nplieger" Plieger</div>
    			</div>
    			<div className="Home__Name">
        			<img src={chat2} alt="Mayeul"/>
        			<div>Mayeul "mlaneyri" Laneyrie</div>
    			</div>
    			<div className="Home__Name">
        			<img src={chat3} alt="Antoine"/>
        			<div>Antoine "anbourge" Bourgeois</div>
   				</div>
    			<div className="Home__Name">
        			<img src={chat4} alt="Julien"/>
        			<div>Julien "julboyer" Boyer</div>
    			</div>
			</div>
		</main>
	);
}

export default Home;