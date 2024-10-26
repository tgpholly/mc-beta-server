import SaveCompressionType from "./server/enums/SaveCompressionType";

export default interface Config {
	port: number,
	maxPlayers: number,
	seed: number|string,
	worldName: string,
	saveCompression: SaveCompressionType
}