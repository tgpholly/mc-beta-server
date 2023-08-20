// https://wiki.vg/index.php?title=Protocol&oldid=488
export enum Packet {
	KeepAlive = 0x00,
	LoginRequest = 0x01,
	Handshake = 0x02,
	Chat = 0x03,
	TimeUpdate = 0x04,
	EntityEquipment = 0x05,
	SpawnPosition = 0x06,
	UseEntity = 0x07,
	UpdateHealth = 0x08,
	Respawn = 0x09,
	Player = 0x0A,
	PlayerPosition = 0x0B,
	PlayerLook = 0x0C,
	PlayerPositionLook = 0x0D,
	PlayerDigging = 0x0E,
	PlayerBlockPlacement = 0x0F,
	HoldingChange = 0x10,
	UseBed = 0x11,
	Animation = 0x12,
	EntityAction = 0x13,
	NamedEntitySpawn = 0x14,

	EntityStatus = 0x26,
	EntityMetadata = 0x28,
	
	PreChunk = 0x32,
	MapChunk = 0x33,
	MultiBlockChange = 0x34,
	BlockChange = 0x035,

	Entity = 0x1E,
	EntityRelativeMove = 0x1F,
	EntityLook = 0x20,
	EntityLookRelativeMove = 0x21,
	EntityTeleport = 0x22,

	DisconnectKick = 0xff
}