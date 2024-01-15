class Api
{
	base_url: string;
	headers = {
		"Content-Type": "application/json",
		"Authorization": ""
	};

	#return_switch(response: Response) {
		if (!response.ok)
			return (Promise.reject(response));
		const content_type = response.headers.get("content-type");
		if (content_type && content_type.toLowerCase().includes("application/json"))
			return (response.json());
		else
			return ({});
	}

	async get(endpoint: string) {
		const response = await fetch(this.base_url + endpoint, {
			headers: this.headers
		});
		if (!response.ok)
			return (Promise.reject(response));
		return (response.json());

	};

	async post(endpoint: string, body: any) {
		const response = await fetch(this.base_url + endpoint, {
			method: "POST",
			headers: this.headers,
			body: JSON.stringify(body)
		});
		return (this.#return_switch(response));
	};

	async delete(endpoint: string, body = {}) {
		const response = await fetch(this.base_url + endpoint, {
			method: "DELETE",
			headers: this.headers,
			body: JSON.stringify(body)
		});
		return (this.#return_switch(response));
	};

	constructor(base_url = "http://localhost", token = "") {
		this.base_url = base_url;
		this.headers.Authorization = "Bearer" + token;
	}
}

export default Api;