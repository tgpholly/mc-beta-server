import { MinecraftServer } from "../MinecraftServer";
import { World } from "../World";
import { Entity } from "./Entity";

export class Player extends Entity {
	public username:string;
	private server:MinecraftServer;

	public constructor(server:MinecraftServer, world:World, username:string) {
		super(world);
		this.server = server;

		this.username = username;
		this.x = 8;
		this.y = 64;
		this.z = 8;
	}
}