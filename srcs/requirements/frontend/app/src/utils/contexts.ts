import { createContext, Dispatch, SetStateAction } from "react";

import Api from "./Api";
import { FriendshipType, ChanType } from "./types";

export const FriendshipContext = createContext({
	id: "0",
	friendships: [] as FriendshipType[],
	action: (() => {}) as Function
});

export const MyContext = createContext({
	logged: false,
	token: "",
	api: new Api(`http://${location.hostname}:3450`),
	addNotif: (() => {}) as Function
});

export const ChatContext = createContext({
	showSidebar: 1,
	setShowSidebar: (() => {}) as Dispatch<SetStateAction<number>>,
	chanList: [] as ChanType[],
});