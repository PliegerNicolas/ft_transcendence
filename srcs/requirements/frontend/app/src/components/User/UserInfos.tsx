import { MyContext } from "../../utils/contexts";
import { useContext } from "react";

import { UserType } from "../../utils/types";
import { useGet, useInvalidate } from "../../utils/hooks";

import defaultPicture from "../../assets/default_profile.png";
import camera from "../../assets/camera.svg";

export default function UserInfos({user, me}: {user: UserType, me: boolean})
{
	const { token, addNotif } = useContext(MyContext);
	const invalidate = useInvalidate();

	const getPic = useGet(["users", user.username, "picture"]);

	function humanFileSize(size: number) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return +(size / Math.pow(1024, i)).toFixed(2) * 1 + ' '
			+ ['', '', 'MB', 'GB', 'TB'][i];
	}

	function postPic(file: File) {
		if (file.size >= 5000000) {
			addNotif({
				type: 1,
				content: `This file is too big (${humanFileSize(file.size)}),
				the limit is 5MB.`});
			return ;
		}

		const data = new FormData()
		data.append('picture', file);

		fetch(`http://${location.hostname}:3450/picture`, {
				method: "POST",
				headers: { "Authorization": token },
				body: data
		}).then(() => {
			invalidate(["users", user.username, "picture"]);
			invalidate(["picture"]);
		}).catch((error: Error) => console.log(error.message));
	}

	return (
		<>
			<h2>
			{
				user.profile.firstName
				+ " « " + user.username + " » "
				+ user.profile.lastName
			}
			</h2>
			<div className="User__Infos">
				<div className="User__PictureContainer">
					<label className="User__Picture" htmlFor={me ? "userPicture" : "machin"}>
						<img className="User__Picture" src={getPic.data || defaultPicture}/>
						{
							me &&
							<div className="User__Camera">
								<img src={camera}/>
							</div>
						}
					</label>
					<img className="User__PictureBg" src={getPic.data || defaultPicture}/>
				</div>
				<div className="genericList User__InfoItems">
					<div><div>Id</div> <div>{"#" + user.id}</div></div>
					<div><div>Username</div> <div>{"@" + user.username}</div></div>
					<div><div>First Name</div> <div>{user.profile.firstName}</div></div>
					<div><div>Last Name</div> <div>{user.profile.lastName}</div></div>
				</div>
			</div>
			<input
				type="file" id="userPicture" name="userPicture"
				style={{display: "none"}}
				onChange={e => postPic(e.currentTarget.files![0])}
			/>
		</>
	);
}