/**
 * Generate a simple HTTP response using given body and status.
 * @param body string of response body
 * @param status status code of response
 */
export function generate_simple_response(body: string, status: number) {
	return new Response(body, {
		status: status,
	})
}

/**
 * Construct API root for specific Telegram token
 * @param token the api token to be used
 */
export function get_api_root(token: string) {
	return "https://api.telegram.org/bot" + token;
}

export function parse_json(str: string): readonly [any, boolean] {
	let jsonObj: any;
	try {
		jsonObj = JSON.parse(str);
		return [jsonObj, true] as const;
	} catch (err) {
		return [null, false] as const;
	}
}
