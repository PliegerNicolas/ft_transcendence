import { createContext, Dispatch, SetStateAction } from "react";

import { FriendshipType, ChanType } from "./types";
import { UseQueryResult } from "@tanstack/react-query";

export const FriendshipContext = createContext({
	id: "0",
	friendships: [] as FriendshipType[],
	action: (() => {}) as Function
});

export const MyContext = createContext({
	logged: false,
	token: "",
	allChans: null as UseQueryResult<any, null> | null,
});

export const ChatContext = createContext({
	showSidebar: 1,
	setShowSidebar: (() => {}) as Dispatch<SetStateAction<number>>,
	chanList: [] as ChanType[],
});