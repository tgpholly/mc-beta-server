import { SaveCompressionType } from "./server/enums/SaveCompressionType";

export interface Config {
	port: number,
	onlineMode: boolean,
	maxPlayers: number,
	seed: number|string,
	worldName: string,
	saveCompression: SaveCompressionType
}