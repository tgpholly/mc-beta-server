import { MetadataEntry, MetadataWriter } from "./MetadataWriter";
import { MetadataFieldType } from "./enums/MetadataFieldType";

export default class EntityMetadata {
	public onFire:boolean = false;
	public crouched:boolean = false;
	public ridingEntity:boolean = false;

	private finalValue:number = 0;

	private static readonly ENTITY_ON_FIRE = 1 << 0;
	private static readonly ENTITY_CROUCHING = 1 << 1;
	private static readonly ENTITY_RIDING = 1 << 2;

	writeMetadata() {
		const metadataWriter = new MetadataWriter();
		this.finalValue =
			(this.onFire ? EntityMetadata.ENTITY_ON_FIRE : 0) | // On Fire
			(this.crouched ? EntityMetadata.ENTITY_CROUCHING : 0) | // Crouching
			(this.ridingEntity ? EntityMetadata.ENTITY_CROUCHING : 0); // Riding entity
					  
		metadataWriter.addMetadataEntry(0, new MetadataEntry(MetadataFieldType.Byte, this.finalValue));

		return metadataWriter.writeBuffer();
	}
}