import "./App.css";
import React from "react";

function App()
{
	const [count, setCount] = React.useState(0);

	function handleClick()
	{
		if (count === 42)
			return ;
		setCount(count + 1);
	}

	return (
		<div className="App">
			<div className={count != 42 ? "App__Count" : "App__Count--42"}>
				{ count }
			</div>
			<button onClick={handleClick} className="App__Button">
				Transcendence !!!
			</button>
		</div>
	);
}

export default App;