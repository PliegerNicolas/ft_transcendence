class Api
{
	base_url: string;
	headers = {
		"Content-Type": "application/json",
		"Authorization": ""
	};
	debug: boolean;
	auth: boolean;

	async #return_switch(response: Response) {
		if (!response.ok)
			return (Promise.reject(new Error(response.status + " " + response.statusText)));
		const content_type = response.headers.get("content-type");
		if (content_type && content_type.toLowerCase().includes("application/json"))
			return (response.json());
		else try {
			const blob = await response.blob();
			return (URL.createObjectURL(blob));
		}
		catch {
			return ({});
		}
	}

	async get(endpoint: string) {
		if (this.debug)
			console.log("GET --> " + endpoint);
		const response = await fetch(this.base_url + endpoint, {
			headers: this.headers
		});
		if (!response.ok)
			return (Promise.reject(new Error(response.status + " " + response.statusText)));
		return (response.json());
	};

	async post(endpoint: string, body: any) {
		if (this.debug)
			console.log("POST --> " + endpoint + " " + JSON.stringify(body));
		const response = await fetch(this.base_url + endpoint, {
			method: "POST",
			headers: this.headers,
			body: JSON.stringify(body)
		});
		return (this.#return_switch(response));
	};

	async delete(endpoint: string, body = {}) {
		if (this.debug)
			console.log("DELETE --> " + endpoint + " " + JSON.stringify(body));
		const response = await fetch(this.base_url + endpoint, {
			method: "DELETE",
			headers: this.headers,
			body: JSON.stringify(body)
		});
		return (this.#return_switch(response));
	};

	async put(endpoint: string, body: any) {
		if (this.debug)
			console.log("PUT --> " + endpoint + " " + JSON.stringify(body));
		const response = await fetch(this.base_url + endpoint, {
			method: "PUT",
			headers: this.headers,
			body: JSON.stringify(body)
		});
		return (this.#return_switch(response));
	};

	async patch(endpoint: string, body: any) {
		if (this.debug)
			console.log("PATCH --> " + endpoint + " " + JSON.stringify(body));
		const response = await fetch(this.base_url + endpoint, {
			method: "PATCH",
			headers: this.headers,
			body: JSON.stringify(body)
		});
		return (this.#return_switch(response));
	};

	constructor(base_url = "http://localhost", token = "") {
		this.base_url = base_url;
		this.headers["Authorization"] = token;
		this.debug = true;
		this.auth = token !== "";
	}
}

export default Api;