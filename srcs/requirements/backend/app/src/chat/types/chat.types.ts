export type Message = {
	content: string,
	sender_id: string,
	channel_id: string,
	date: Date
}

export type MessagePayloads = {
	content: string,
	channel: string,
}