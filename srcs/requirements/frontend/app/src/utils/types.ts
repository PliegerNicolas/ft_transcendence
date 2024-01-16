export interface UserType {
	id: string,
	username: string,
	email: string,
	updated_at: string,
	created_at: string,
	profile: {
		id: string,
		firstName: string,
		lastName:string
	}
}