import {Market} from "./eastMoney";

export default interface Stock {
	market: Market;
	id: string;
	position: number;
}
