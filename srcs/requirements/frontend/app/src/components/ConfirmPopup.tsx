import { PopupType } from "../utils/types";

export default function ConfirmPopup(
	{title, text, action, cancelFt, actionFt}: PopupType
)
{
	return (
		<div className="Popup__Bg">
			<div className="Popup">
				<h3> {title} </h3>
				<div className="DeletePopup__Notice"> {text} </div>
				<div className="DeletePopup__Buttons">
					<button onClick={() => cancelFt()}>
						Cancel
					</button>
					<button onClick={() => actionFt()} className="danger">
						{action}
					</button>
				</div>
			</div>
		</div>
	);
}