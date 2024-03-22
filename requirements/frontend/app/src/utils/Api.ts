class Api
{
	base_url: string;
	headers = { "Content-Type": "application/json" };
	debug: boolean;

	async #return_switch(res: Response) {
		if (!res.ok) {
			const err = await res.json();

			if (!err.statusCode || !err.message)
				return (Promise.reject(new Error(res.status + " " + res.statusText)));

			return (Promise.reject(new Error(err.statusCode + " " + err.message)));
		}
		const contentType = res.headers.get("Content-Type");
		if (contentType && contentType.toLowerCase().includes("application/json"))
			return (res.json());
		else try {
			const blob = await res.blob();
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
			headers: this.headers,
			credentials: "include",
		});
		return (this.#return_switch(response));
	};

	async post(endpoint: string, body: unknown) {
		if (this.debug)
			console.log("POST --> " + endpoint + " " + JSON.stringify(body));
		const response = await fetch(this.base_url + endpoint, {
			method: "POST",
			headers: this.headers,
			body: JSON.stringify(body),
			credentials: "include",
		});
		return (this.#return_switch(response));
	};

	async delete(endpoint: string, body = {}) {
		if (this.debug)
			console.log("DELETE --> " + endpoint + " " + JSON.stringify(body));
		const response = await fetch(this.base_url + endpoint, {
			method: "DELETE",
			headers: this.headers,
			body: JSON.stringify(body),
			credentials: "include",
		});
		return (this.#return_switch(response));
	};

	async put(endpoint: string, body: any) {
		if (this.debug)
			console.log("PUT --> " + endpoint + " " + JSON.stringify(body));
		const response = await fetch(this.base_url + endpoint, {
			method: "PUT",
			headers: this.headers,
			body: JSON.stringify(body),
			credentials: "include",
		});
		return (this.#return_switch(response));
	};

	async patch(endpoint: string, body: any) {
		if (this.debug)
			console.log("PATCH --> " + endpoint + " " + JSON.stringify(body));
		const response = await fetch(this.base_url + endpoint, {
			method: "PATCH",
			headers: this.headers,
			body: JSON.stringify(body),
			credentials: "include",
		});
		return (this.#return_switch(response));
	};

	constructor(base_url = "https://localhost:4433/api") {
		this.base_url = base_url;
		this.debug = false;
	}
}

export default Api;
