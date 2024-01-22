export type Message = {
	content: string,
	sender_id: Number,
	channel_id: Number,
	date: Date
}

export interface ServerToClientEvents {
	newMessage: (payload: Message) => void;
}
