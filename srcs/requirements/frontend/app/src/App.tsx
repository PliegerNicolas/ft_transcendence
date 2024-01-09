import "./App.css";
import Header from "./components/Header.tsx";
import MainContent from "./components/MainContent.tsx";
import Navbar from "./components/Navbar.tsx";

function App()
{
	return (
		<div className="App">
			<Header />
			<div className="App__Content">
				<Navbar />
				<MainContent />
			</div>
		</div>
	);
}

export default App;