import {get_api_root} from "./utility";

export class ChatPermissions {
	can_send_messages = false;
	can_send_media_messages = false;
	can_send_polls = false;
	can_send_other_messages = false;
	can_add_web_page_previews = false;
	can_change_info = false;
	can_invite_users = false;
	can_pin_messages = false;


	constructor(can_send_messages = false,
				can_send_media_messages = false,
				can_send_polls = false,
				can_send_other_messages = false,
				can_add_web_page_previews = false,
				can_change_info = false,
				can_invite_users = false,
				can_pin_messages = false) {
		this.can_send_messages = can_send_messages;
		this.can_send_media_messages = can_send_media_messages;
		this.can_send_polls = can_send_polls;
		this.can_send_other_messages = can_send_other_messages;
		this.can_add_web_page_previews = can_add_web_page_previews;
		this.can_change_info = can_change_info;
		this.can_invite_users = can_invite_users;
		this.can_pin_messages = can_pin_messages;
	}
}

async function call_telegram_api(token: string, methodName: string, body: any) {
	const URL = get_api_root(token) + "/" + methodName;
	const bodyStr = JSON.stringify(body);
	const request = new Request(URL, {
		body: bodyStr,
		headers: new Headers({
			"Content-Type": "application/json"
		}),
		method: "POST"
	});

	return await fetch(request);
}

export async function unpin_chat_message(token: string, chat_id: string | number, message_id: number) {
	return await call_telegram_api(token, "unpinChatMessage", {
		chat_id,
		message_id,
	});
}

export async function delete_message(token: string, chat_id: string | number, message_id: number) {
	return await call_telegram_api(token, "deleteMessage", {
		chat_id,
		message_id,
	});
}

export async function restrict_chat_member(token: string, chat_id: string | number, user_id: number, perm: ChatPermissions) {
	return await call_telegram_api(token, "restrictChatMember", {
		chat_id,
		user_id,
		permissions: perm,
	});
}

export async function send_message(token: string, chat_id: string | number, text: string, parsing: string) {
	return await call_telegram_api(token, "sendMessage", {
		chat_id,
		text,
		parse_mode: parsing,
	});
}

export async function get_chat_member(token: string, chat_id: string | number, user_id: number) {
	return await call_telegram_api(token, "getChatMember", {
		chat_id,
		user_id,
	});
}

export async function unban_chat_member(token: string, chat_id: string | number, user_id: number, only_if_banned: boolean) {
	return await call_telegram_api(token, "unbanChatMember", {
		chat_id,
		user_id,
		only_if_banned,
	});
}

export async function send_sticker(token: string, chat_id: string | number, sticker_id: string) {
	return await call_telegram_api(token, "sendSticker", {
		chat_id,
		sticker: sticker_id,
	});
}
