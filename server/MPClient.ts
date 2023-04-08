import { Socket } from "net";
import { IEntity } from "./entities/IEntity";
import { Writer } from "../bufferStuff";

export class MPClient {
	private readonly socket:Socket;
	private readonly entity:IEntity;

	public constructor(socket:Socket, entity:IEntity) {
		this.socket = socket;
		this.entity = entity;
	}

	send(buffer:Buffer|Writer) {
		if (buffer instanceof Writer) {
			this.socket.write(buffer.toBuffer());
		} else {
			this.socket.write(buffer);
		}
	}
}