import { createWriter, Endian } from "bufferstuff";
import { FunkyArray } from "../funkyArray";
import { MetadataFieldType } from "./enums/MetadataFieldType";

export class MetadataEntry {
	public type:MetadataFieldType;
	public value:number|string;

	public constructor(type:MetadataFieldType, value:number|string) {
		this.type = type;
		this.value = value;
	}
}

export class MetadataWriter {
	// https://wiki.vg/index.php?title=Protocol&oldid=488#Entity_Metadata_.280x28.29
	private entries:FunkyArray<number, MetadataEntry>; // TODO: Extend with Item and Vector types

	public constructor() {
		this.entries = new FunkyArray<number, MetadataEntry>();
	}

	public addMetadataEntry(identifier:number, entry:MetadataEntry) {
		this.entries.set(identifier, entry);
	}

	private calculateBufferSize() {
		let size = this.entries.length + 1; // Type/Identifiers + Stream end magic
		this.entries.forEach(entry => {
			switch (entry.type) {
				case MetadataFieldType.Byte: size += 1; break;
				case MetadataFieldType.Short: size += 2; break;
				case MetadataFieldType.Int: size += 4; break;
				case MetadataFieldType.Float: size += 4; break;
				case MetadataFieldType.String:
					if (typeof(entry.value) === "string") {
						size += 2 + entry.value.length * 2; break;
					}
			}
		})

		return size;
	}

	public writeBuffer() {
		const writer = createWriter(Endian.BE, this.calculateBufferSize());
		for (let key of this.entries.keys) {
			const entry = this.entries.get(key);
			if (entry instanceof MetadataEntry) {
				writer.writeByte((entry.type << 5 | key & 0x1f) & 0xff);
				if (typeof(entry.value) === "number") {
					switch (entry.type) {
						case MetadataFieldType.Byte: writer.writeByte(entry.value); break;
						case MetadataFieldType.Short: writer.writeShort(entry.value); break;
						case MetadataFieldType.Int: writer.writeInt(entry.value); break;
						case MetadataFieldType.Float: writer.writeFloat(entry.value); break;
					}
				} else if (typeof(entry.value) === "string") {
					writer.writeString16(entry.value);
				}
			}
		}

		// Metadata end magic
		writer.writeByte(0x7F);

		return writer.toBuffer();
	}
}