import { useNavigate } from "react-router-dom";

const invitePlayer = () => {
	const navigate = useNavigate();

	const toPrivatePlay1=()=>{
  		navigate('/play/private',{state:{
			lobby: "caca",
			playerNumber: 1,
		}});
	}

	return (
		<div>
			<div> <a onClick={()=>{toPrivatePlay1()}}>Join private room 1</a></div>
		</div>
	);
}