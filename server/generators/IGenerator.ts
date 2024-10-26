import Chunk from "../Chunk";

export default interface IGenerator {
	generate: (chunk:Chunk) => void
}