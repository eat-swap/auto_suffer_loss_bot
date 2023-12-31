import {Env} from "./index";
import {POSITION} from "./config";
import {get_quote, Market, MARKET_LIST} from "./eastMoney";
import dayjs from "dayjs";
import {send_message} from "./telegram";

export async function handle_profit(env: Env) {
	const today = dayjs();
	// console.log(`Handling profit, time now ${today.format()}`);
	const profit: Record<Market, number> = MARKET_LIST.reduce((obj, cur) => {
		obj[cur.id] = 0;
		return obj;
	}, {} as Record<Market, number>)
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
		profit[s.market] += p;
	}

	const formatter = (p: number) => (`${p > 0 ? "获得收益" : "蒙受亏损"} ${
		Math.abs(p).toFixed(Math.abs(Math.round(p) - p) < 5e-3 ? 0 : 2)
	} 人民币元`);

	const formatted_strings = MARKET_LIST.map(market => (
		profit[market.id] !== 0 ? `在${market.name}${formatter(profit[market.id])}` : ""
	)).filter(it => it.length > 0);

	const reply_to = Number(await env.investment.get(`${env.CHANNEL_ID}:last`) ?? "-1");
	// console.log(`Replying to: ${reply_to}`);
	const last_date = await env.investment.get(`${env.CHANNEL_ID}:date`);
	if (last_date && dayjs(last_date).isSame(today, "d")) {
		return;
	}

	const send_msg_resp = await send_message(
		env.API_KEY,
		env.CHANNEL_ID,
		formatted_strings.length <= 0 ?
			"今日未录得损益" :
			`今日${formatted_strings.join("，")}`,
		undefined,
		reply_to,
		true,
	);
	const resp_json: any = await send_msg_resp.json();
	// console.log(JSON.stringify(resp_json));
	const new_msg_id = resp_json.result.message_id;
	// console.log(`New message id: ${new_msg_id}`);

	await env.investment.put(`${env.CHANNEL_ID}:last`, `${new_msg_id}`);
	await env.investment.put(`${env.CHANNEL_ID}:date`, `${dayjs().format("YYYY-MM-DD HH:mm:ss")}`);
	// console.log("Finished processing profit.");
}
