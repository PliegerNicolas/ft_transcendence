export type CreateChannelParams = {
	name: string,
	type: 'public' | 'private' | 'password',
	owner_id: string,
	password?: string,
}
