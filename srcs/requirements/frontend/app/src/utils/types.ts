export interface UserType {
	id: string,
	username: string,
	email: string,
	profile: {
		id: string,
		firstName: string,
		lastName:string
	}
}