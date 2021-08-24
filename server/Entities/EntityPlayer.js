const EntityLiving = require("./EntityLiving.js");
const user = require("../user.js");

const Converter = require("../Converter.js");
const PacketMappingTable = require("../PacketMappingTable.js");
const NamedPackets = require("../NamedPackets.js");

class EntityPlayer extends EntityLiving {
	constructor(parent = new user, x = 0, y = 0, z = 0) {
		super(parent.id, x, y, z);

		this.lastX = 0;
		this.lastY = 0;
		this.lastZ = 0;
		this.absX = 0;
		this.absY = 0;
		this.absZ = 0;

		this.absYaw = 0;
		this.absPitch = 0;

		this.lastYaw = 0;
		this.lastPitch = 0;

		this.allPacket = new PacketMappingTable[NamedPackets.EntityTeleport](this.EID, this.x, this.y, this.z, this.absYaw, this.absPitch);
		this.allPacket.soup();
		this.allPacket.writePacket();

		this.parentPlayer = parent;
	}

	onTick() {
		super.onTick();

		this.absX = Math.floor(this.x);
		this.absY = Math.floor(this.y);
		this.absZ = Math.floor(this.z);

		this.absYaw = Math.floor(this.yaw);
		this.absPitch = Math.floor(this.pitch);

		if ((this.absX != this.lastX || this.absY != this.lastY || this.absZ != this.lastZ)) {
			// all
			this.allPacket.writer.offset = 5;
			this.allPacket.writer.writeInt(Converter.toAbsoluteInt(this.x));
			this.allPacket.writer.writeInt(Converter.toAbsoluteInt(this.y));
			this.allPacket.writer.writeInt(Converter.toAbsoluteInt(this.z));
			this.allPacket.writer.writeUByte(Converter.to360Fraction(this.absYaw));
			this.allPacket.writer.writeUByte(Converter.to360Fraction(this.absPitch));

			global.sendToAllPlayersButSelf(this.EID, this.allPacket.toBuffer());
		} else if (this.absYaw != this.lastYaw || this.absPitch != this.lastPitch) {
			// look only
			global.sendToAllPlayersButSelf(this.EID, new PacketMappingTable[NamedPackets.EntityLook](this.EID, this.absYaw, this.absPitch).writePacket());
		}

		this.lastYaw = this.absYaw;
		this.lastPitch = this.absPitch;

		this.lastX = this.absX;
		this.lastY = this.absY;
		this.lastZ = this.absZ;
	}
}

module.exports = EntityPlayer;