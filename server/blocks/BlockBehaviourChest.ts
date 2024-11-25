import TileEntityChest from "../tileentities/TileEntityChest";
import Vec3 from "../Vec3";
import World from "../World";
import BlockBehaviour from "./BlockBehaviour";

export default class BlockBehaviourChest extends BlockBehaviour {
	public placed(world:World, x:number, y:number, z:number) {
		const chunk = world.getChunk(x >> 4, z >> 4);
		chunk.setTileEntity(new TileEntityChest(new Vec3(x & 0xf, y, z & 0xf)), x, y, z);
	}

	public destroyed(world:World, x:number, y:number, z:number) {
		const chunk = world.getChunk(x >> 4, z >> 4);
		chunk.removeTileEntity(x, y, z);
	}
}