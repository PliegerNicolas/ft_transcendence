import { createContext, Dispatch, SetStateAction } from "react";

import Api from "./Api";
import { FriendshipType } from "./types";

export const FriendshipContext = createContext({
	id: "0",
	friendships: [] as FriendshipType[],
	action: (() => {}) as Function
});

export const MyContext = createContext({
	logged: false,
	token: "",
	setLogInfo: (() => {}) as Function,
	api: new Api(`http://${location.hostname}:3450`),
	addNotif: (() => {}) as Function,
	addInvite: (() => {}) as Function,
	lastChan: "",
	setLastChan: (() => {}) as Function,
});

export const ChatContext = createContext({
	showSidebar: 1,
	setShowSidebar: (() => {}) as Dispatch<SetStateAction<number>>,
});