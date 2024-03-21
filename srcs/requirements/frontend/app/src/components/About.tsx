import page1 from "../assets/subject/page1.png"
import page2 from "../assets/subject/page2.png"
import page3 from "../assets/subject/page3.png"
import page4 from "../assets/subject/page4.png"
import page5 from "../assets/subject/page5.png"
import page6 from "../assets/subject/page6.png"
import page7 from "../assets/subject/page7.png"
import "../styles/about.css";

function About()
{
	return (
		<main className="MainContent">
			<img className="pdf" src={page1}/>
			<img className="pdf" src={page2}/>
			<img className="pdf" src={page3}/>
			<img className="pdf" src={page4}/>
			<img className="pdf" src={page5}/>
			<img className="pdf" src={page6}/>
			<img className="pdf" src={page7}/>
		</main>
	);
}

export default About;