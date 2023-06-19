import { readFileSync, readFile, writeFile, existsSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import { createWriter, createReader } from "../bufferStuff/index";
import { Config } from "../config";
import { Chunk } from "./Chunk";
import { SaveCompressionType } from "./enums/SaveCompressionType";
import { deflate, inflate } from "zlib";
import { World } from "./World";
import { Endian } from "../bufferStuff/Endian";

export class WorldSaveManager {
	private readonly worldFolderPath;
	private readonly worldChunksFolderPath;
	private readonly worldPlayerDataFolderPath;
	private readonly infoFilePath;

	private readonly config:Config;

	public worldCreationDate = new Date();
	public worldLastLoadDate = new Date();
	public worldSeed = Number.MIN_VALUE;

	public chunksOnDisk:Array<number>;

	public constructor(config:Config, numericalSeed:number) {
		this.chunksOnDisk = new Array<number>();

		this.worldFolderPath = `./${config.worldName}`;
		this.worldChunksFolderPath = `${this.worldFolderPath}/chunks`;
		this.worldPlayerDataFolderPath = `${this.worldFolderPath}/playerdata`;
		this.infoFilePath = `${this.worldFolderPath}/info.hwd`;

		this.config = config;

		// Create world folder if it doesn't exist
		if (!existsSync(this.worldFolderPath)) {
			mkdirSync(this.worldFolderPath);
		}

		if (existsSync(this.infoFilePath)) {
			this.readInfoFile();
		} else {
			// World info file does not exist
			this.worldSeed = numericalSeed;
			this.createInfoFile(numericalSeed);
		}

		if (!existsSync(this.worldChunksFolderPath)) {
			mkdirSync(this.worldChunksFolderPath);
		} else {
			const chunkFiles = readdirSync(this.worldChunksFolderPath);
			for (let file of chunkFiles) {
				if (file.endsWith(".hwc")) {
					const numbers = file.split(".")[0].split(",");
					this.chunksOnDisk.push(Chunk.CreateCoordPair(parseInt(numbers[0]), parseInt(numbers[1])));
				}
			}
		}

		if (!existsSync(this.worldPlayerDataFolderPath)) {
			mkdirSync(this.worldPlayerDataFolderPath);
		}
	}

	private createInfoFile(numericalSeed:number) {
		const infoFileWriter = createWriter(Endian.BE, 26);
		infoFileWriter.writeUByte(0xFD); // Info File Magic
		infoFileWriter.writeUByte(0); // File Version
		infoFileWriter.writeLong(this.worldCreationDate.getTime()); // World creation date
		infoFileWriter.writeLong(this.worldLastLoadDate.getTime()); // Last load date
		infoFileWriter.writeLong(numericalSeed);
		writeFileSync(this.infoFilePath, infoFileWriter.toBuffer());
	}

	private readInfoFile() {
		const infoFileReader = createReader(Endian.BE, readFileSync(this.infoFilePath));
		const fileMagic = infoFileReader.readUByte();
		if (fileMagic !== 0xFD) {
			throw new Error("World info file is invalid");
		}

		const fileVersion = infoFileReader.readByte();
		if (fileVersion === 0) {
			this.worldCreationDate = new Date(Number(infoFileReader.readLong()));
			infoFileReader.readLong(); // Last load time is currently ignored
			this.worldSeed = Number(infoFileReader.readLong());
		}
	}

	public writeChunkToDisk(chunk:Chunk) {
		return new Promise<boolean>((resolve, reject) => {
			resolve(false);
		});
		return new Promise<boolean>((resolve, reject) => {
			const saveType = this.config.saveCompression;
			const chunkFileWriter = createWriter(Endian.BE, 10);
			chunkFileWriter.writeUByte(0xFC); // Chunk File Magic
			// TODO: Change to 1 when lighting actually works
			chunkFileWriter.writeUByte(1); // File Version
			chunkFileWriter.writeUByte(saveType); // Save compression type
			chunkFileWriter.writeUByte(16); // Chunk X
			chunkFileWriter.writeUByte(128); // Chunk Y
			chunkFileWriter.writeUByte(16); // Chunk Z

			const chunkData = createWriter(Endian.BE)
				.writeBuffer(Buffer.from(chunk.getData()))
				.writeBuffer(chunk.getMetadataBuffer())
				.writeBuffer(chunk.getBlockLightBuffer())
				.writeBuffer(chunk.getSkyLightBuffer()).toBuffer();

			if (saveType === SaveCompressionType.NONE) {
				chunkFileWriter.writeInt(chunkData.length); // Data length
				chunkFileWriter.writeBuffer(chunkData); // Chunk data

				writeFile(`${this.worldChunksFolderPath}/${Chunk.CreateCoordPair(chunk.x, chunk.z).toString(16)}.hwc`, chunkFileWriter.toBuffer(), () => {
					const cPair = Chunk.CreateCoordPair(chunk.x, chunk.z);
					if (!this.chunksOnDisk.includes(cPair)) {
						this.chunksOnDisk.push(cPair);
					}

					resolve(true);
				});
			} else if (saveType === SaveCompressionType.DEFLATE) {
				deflate(chunkData, (err, data) => {
					if (err) {
						return reject(err);
					}

					chunkFileWriter.writeInt(data.length);
					chunkFileWriter.writeBuffer(data);

					writeFile(`${this.worldChunksFolderPath}/${Chunk.CreateCoordPair(chunk.x, chunk.z).toString(16)}.hwc`, chunkFileWriter.toBuffer(), () => {
						const cPair = Chunk.CreateCoordPair(chunk.x, chunk.z);
						if (!this.chunksOnDisk.includes(cPair)) {
							this.chunksOnDisk.push(cPair);
						}
						//console.log(`Wrote ${chunk.x},${chunk.z} to disk`);
						resolve(true);
					});
				})
			} else if (saveType === SaveCompressionType.XZ) {
				// TODO: Implement XZ chunk saving
			}
		});
	}

	readChunkFromDisk(world:World, x:number, z:number) {
		return new Promise<Chunk>((resolve, reject) => {
			readFile(`${this.worldChunksFolderPath}/${Chunk.CreateCoordPair(x, z).toString(16)}.hwc`, (err, data) => {
				if (err) {
					return reject(err);
				}

				const chunkFileReader = createReader(Endian.BE, data);
				
				// Check file validity
				if (chunkFileReader.readUByte() !== 0xFC) {
					return reject(new Error("Chunk file is invalid"));
				}

				const fileVersion = chunkFileReader.readUByte();
				if (fileVersion === 0) {
					const saveCompressionType:SaveCompressionType = chunkFileReader.readUByte();
					const chunkX = chunkFileReader.readUByte();
					const chunkY = chunkFileReader.readUByte();
					const chunkZ = chunkFileReader.readUByte();
					const totalByteSize = chunkX * chunkZ * chunkY;

					const contentLength = chunkFileReader.readInt();
					if (saveCompressionType === SaveCompressionType.NONE) {
						const chunkData = createReader(Endian.BE, chunkFileReader.readBuffer(contentLength));
						const chunk = new Chunk(world, x, z, chunkData.readUint8Array(totalByteSize), chunkData.readUint8Array(totalByteSize / 2));
						resolve(chunk);
					} else if (saveCompressionType === SaveCompressionType.DEFLATE) {
						inflate(chunkFileReader.readBuffer(contentLength), (err, data) => {
							if (err) {
								return reject(err);
							}

							const chunkData = createReader(Endian.BE, data);
							const chunk = new Chunk(world, x, z, chunkData.readUint8Array(totalByteSize), chunkData.readUint8Array(totalByteSize / 2));
							resolve(chunk);
						});
					}
				} else if (fileVersion === 1) {
					const saveCompressionType:SaveCompressionType = chunkFileReader.readUByte();
					const chunkX = chunkFileReader.readUByte();
					const chunkY = chunkFileReader.readUByte();
					const chunkZ = chunkFileReader.readUByte();
					const totalByteSize = chunkX * chunkZ * chunkY;

					const contentLength = chunkFileReader.readInt();
					if (saveCompressionType === SaveCompressionType.NONE) {
						const chunkData = createReader(Endian.BE, chunkFileReader.readBuffer(contentLength));
						const chunk = new Chunk(world, x, z, chunkData.readUint8Array(totalByteSize), chunkData.readUint8Array(totalByteSize / 2), chunkData.readUint8Array(totalByteSize / 2), chunkData.readUint8Array(totalByteSize / 2));
						resolve(chunk);
					} else if (saveCompressionType === SaveCompressionType.DEFLATE) {
						inflate(chunkFileReader.readBuffer(contentLength), (err, data) => {
							if (err) {
								return reject(err);
							}

							const chunkData = createReader(Endian.BE, data);
							const chunk = new Chunk(world, x, z, chunkData.readUint8Array(totalByteSize), chunkData.readUint8Array(totalByteSize / 2), chunkData.readUint8Array(totalByteSize / 2), chunkData.readUint8Array(totalByteSize / 2));
							resolve(chunk);
						});
					}
				}
			});
		});
	}
}