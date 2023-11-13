import {Env} from "./index";
import {POSITION} from "./config";
import {get_quote, KLine} from "./eastMoney";
import dayjs from "dayjs";
import Stock from "./stock";
import {send_message} from "./telegram";

export async function handle_profit(env: Env) {
	const today = dayjs();
	console.log(`Handling profit, time now ${today.format()}`);
	const profit = await Promise.all(
		POSITION.map((s): Promise<[Stock, KLine[]]> =>
			new Promise(async () => [s, await get_quote(s.market, s.id)]),
		),
	).then(it =>
		it.reduce(
			(sum, [s, kls]): number => {
				kls.sort((a, b) =>
					a.date.isBefore(b.date) ? 1 : a.date.isAfter(b.date) ? -1 : 0,
				);
				const [d1, d2] = kls;
				return d1.date.isSame(today, "d") ? s.position * (d1.close - d2.close) + sum : sum;
			},
			0,
		),
	);

	const formatted = Math.abs(profit).toFixed(2);
	console.log(`Total profit: ${profit.toFixed(2)}`);

	const reply_to = Number(await env.investment.get(`${env.CHANNEL_ID}:last`) ?? "-1");
	console.log(`Replying to: ${reply_to}`);

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
	const new_msg_id = resp_json.message_id;
	console.log(`New message id: ${new_msg_id}`);

	await env.investment.put(`${env.CHANNEL_ID}:last`, `${new_msg_id}`);
	console.log("Finished processing profit.");
}
