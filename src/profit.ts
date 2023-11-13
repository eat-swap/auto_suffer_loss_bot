import {Env} from "./index";
import {POSITION} from "./config";
import {get_quote, KLine, Market} from "./eastMoney";
import dayjs from "dayjs";
import {send_message} from "./telegram";

export async function handle_profit(env: Env) {
	const today = dayjs();
	// console.log(`Handling profit, time now ${today.format()}`);
	let profit = 0;
	for (const s of POSITION) {
		// console.log(`Sending request for ${s.id}`);
		const quote = await get_quote(s.market, s.id);
		// console.log(`Ready to sort ${s.id}`);
		quote.sort((a, b) =>
			a.date.isBefore(b.date) ? 1 : a.date.isAfter(b.date) ? -1 : 0,
		);
		// console.log(`Sorted ${s.id}`);
		const [d1, d2] = quote;
		const p = d1.date.isSame(today, "d") ? s.position * (d1.close - d2.close) : 0;
		// console.log(`[${d1.date.format("YYYY-MM-DD")}] [${Market[s.market]}] [${s.id}] Profit: ${p.toFixed(2)}`)
		profit += p;
	}

	const formatted = Math.abs(profit).toFixed(2);
	// console.log(`Total profit: ${profit.toFixed(2)}`);

	const reply_to = Number(await env.investment.get(`${env.CHANNEL_ID}:last`) ?? "-1");
	// console.log(`Replying to: ${reply_to}`);

	const send_msg_resp = await send_message(
		env.API_KEY,
		env.CHANNEL_ID,
		Math.abs(profit) < 1e-3 ?
			"今日在上海证券交易所未录得损益" :
			`今日在上海证券交易所${profit > 0 ? "获得收益" : "蒙受亏损"} ${formatted} 人民币元`,
		undefined,
		reply_to,
		true,
	);
	const resp_json: any = await send_msg_resp.json();
	// console.log(JSON.stringify(resp_json));
	const new_msg_id = resp_json.result.message_id;
	// console.log(`New message id: ${new_msg_id}`);

	await env.investment.put(`${env.CHANNEL_ID}:last`, `${new_msg_id}`);
	// console.log("Finished processing profit.");
}
