import dayjs from "dayjs";
import {parse_json} from "./utility";

export enum Market {
	SHENZHEN = 0,
	SHANGHAI,
}

export interface QuoteResponse {
	code: string;
	market: Market;
	name: string;
	decimal: number;
	klines: string[];
}

export interface KLine {
	date: dayjs.Dayjs;
	open: number;
	close: number;
	high: number;
	low: number;
	totalHands: number;
	totalAmount: number;
	// skip 2 unrecognised fields
	diff: number;
}

export async function get_quote(market: Market, stock_id: string): Promise<KLine[]> {
	console.log("get_quote() entered.");
	const params = new URLSearchParams();
	params.set("klt", "101");
	params.set("fqt", "1");
	params.set("lmt", "5"); // limit
	params.set("end", "20500000");
	params.set("iscca", "1");
	params.set("fields1", "f1,f2,f3,f4,f5,f6,f7,f8");
	params.set("fields2", "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64");
	params.set("forcect", "1");

	params.set("secid", `${Number(market)}.${stock_id}`);

	console.log("Finished setting params, making request");

	const resp = await fetch(`https://push2his.eastmoney.com/api/qt/stock/kline/get?${params}`, {
		headers: {
			Origin: "https://waptest.eastmoney.com",
			Referer: "https://waptest.eastmoney.com",
		},
	});

	console.log("Request OK, getting text");
	const text = await resp.text();

	console.log("Parsing into json");
	const [json, ok] = parse_json(text);
	if (!ok || !json.data) {
		return [];
	}

	console.log("Deserializing K Lines");
	const quote = json.data as QuoteResponse;
	return quote.klines.map(it => {
		const sp = it.split(",");
		console.log("One K-Line OK");
		return {
			date: dayjs(sp[0]),
			open: Number(sp[1]),
			close: Number(sp[2]),
			high: Number(sp[3]),
			low: Number(sp[4]),
			totalHands: Number(sp[5]),
			totalAmount: Number(sp[6]),
			diff: Number(sp[9]),
		};
	});
}
