import chat1 from "../assets/chat1.jpeg";
import chat2 from "../assets/chat2.jpeg";
import chat3 from "../assets/chat3.jpeg";
import chat4 from "../assets/chat4.jpeg";

function Home()
{
	return (
		<main className="MainContent">
			<h2>This site has been made by :</h2>
			<div><img src={chat1}/> Nicolas "nplieger" Plieger</div>
			<div><img src={chat2}/> Mayeul "mlaneyri" Laneyrie</div>
			<div><img src={chat3}/> Antoine "anbourge" Bourgeois</div>
			<div><img src={chat4}/> Julien "julboyer" Boyer</div>
			
		</main>
	);
}

export default Home;