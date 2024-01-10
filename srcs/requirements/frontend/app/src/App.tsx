import "./App.css";

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header.tsx";
import Navbar from "./components/Navbar.tsx";

import Home from "./components/Home.tsx";
import Play from "./components/Play.tsx";
import Stats from "./components/Stats.tsx";
import Chat from "./components/Chat.tsx";
import Settings from "./components/Settings.tsx";
import About from "./components/About.tsx";
import APISandbox from "./components/APISandbox.tsx";

function App()
{
	const [navCurrent, setNavCurrent] = React.useState(0);

	return (
		<div className="App">
			<Header />
			<Router>
				<div className="App__Content">
					<Navbar current={navCurrent} setCurrent={setNavCurrent}/>
					<Routes>
						<Route path="/"	element={<Home />} />
						<Route path="/play" element={<Play />} />
						<Route path="/stats" element={<Stats />} />
						<Route path="/chat" element={<Chat />} />
						<Route path="/settings" element={<Settings />} />
						<Route path="/about" element={<About />} />
						<Route path="/apisandbox" element={<APISandbox />} />
					</Routes>
				</div>
			</Router>
		</div>
	);
}

export default App;