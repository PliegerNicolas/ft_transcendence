import { MyContext } from "../../utils/contexts";
import { useContext, useState } from "react";

import { UserType } from "../../utils/types";
import { useGet, useInvalidate, useMutateError } from "../../utils/hooks";

import defaultPicture from "../../assets/default_profile.png";
import camera from "../../assets/camera.svg";
import { useMutation } from "@tanstack/react-query";
import ConfirmPopup from "../ConfirmPopup";
import { socket } from "../../App";

export default function UserInfos({user, me}: {user: UserType, me: boolean})
{
	const { addNotif, api } = useContext(MyContext);
	const invalidate = useInvalidate();
	const mutateError = useMutateError();

	const getPic = useGet(["users", user.username, "picture"]);

	function humanFileSize(size: number) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return +(size / Math.pow(1024, i)).toFixed(2) * 1 + ' '
			+ ['', 'KiB', 'MiB', 'GiB', 'TiB'][i];
	}

	async function postPic(file: File) {
		if (file.size >= 5000000) {
			addNotif({
				type: 1,
				content: `This file is too big (${humanFileSize(file.size)}),
				the limit is 5MiB.`});
			return ;
		}

		const data = new FormData()
		data.append('picture', file);

		const res = await fetch(`https://${location.hostname}:4433/api/picture`, {
				method: "PUT",
				credentials: "include",
				body: data
		});

		if (res.ok) {
			invalidate(["users", user.username, "picture"]);
			invalidate(["picture"]);
		}
		else try {
			const err = await res.json();

			if (!err.statusCode || !err.message)
				addNotif({content: res.status + " " + res.statusText});
			else
				addNotif({content: err.statusCode + " " + err.message});
		}
		catch (err) {}
	}

	const patchUser = useMutation({
		mutationFn: ({username}: {username: string}) =>
			api.patch("/me", {username}),
		onSettled: () => invalidate(["me"]),
		onError: mutateError,
	});

	const [nameEditPopup, setNameEditPopup] = useState(false);
	const [newUsername, setNewUsername] = useState("");

	return (
		<>
			<h2 style={{marginLeft: "20px"}}>
			{
				user.username
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
					<div><div>Username</div> <div>{"@" + user.username}<button className="User__EditButton" onClick={() => setNameEditPopup(true)}>edit</button></div></div>
					<div><div>First Name</div> <div>{user.profile.firstName}</div></div>
					<div><div>Last Name</div> <div>{user.profile.lastName}</div></div>
				</div>
			</div>
			<input
				type="file" id="userPicture" name="userPicture"
				style={{display: "none"}}
				onChange={e => postPic(e.currentTarget.files![0])}
			/>
			{
				nameEditPopup &&
				<ConfirmPopup
					title="Edit Username"
					text={<>
						<div style={{textAlign: "center"}}>
							<input type="text" placeholder="new username" value={newUsername}
								onChange={(ev) => setNewUsername(ev.currentTarget.value)}
							/>
						</div>
					</>}
					cancelFt={() => {
						setNameEditPopup(false);
					}}
					action="Confirm"
					actionFt={() => {
						patchUser.mutate({username: newUsername});
						setNameEditPopup(false);
						socket.emit('newUsername', newUsername);
						setNewUsername('');
					}}
				/>
			}
		</>
	);
}