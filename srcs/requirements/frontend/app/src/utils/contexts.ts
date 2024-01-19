import {createContext} from "react";

import { FriendshipType } from "./types";

interface FriendshipContextType {
	id: string,
	friendships: FriendshipType[]
}

export const FriendshipContext = createContext(
	{id: "0", friendships: []} as FriendshipContextType
);