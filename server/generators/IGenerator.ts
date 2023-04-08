import { Chunk } from "../Chunk";

export interface IGenerator {
	generate: (chunk:Chunk) => void
}