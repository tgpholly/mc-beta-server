import { createWriter, createReader, Endian, IWriter, IReader } from "bufferstuff";
import { readFileSync, readFile, writeFile, existsSync, mkdirSync, writeFileSync, readdirSync, renameSync } from "fs";
import { Console } from "hsconsole";
import { deflate, inflate } from "zlib";
import Chunk from "./Chunk";
import Config from "../config";
import FunkyArray from "funky-array";
import SaveCompressionType from "./enums/SaveCompressionType";
import TileEntityLoader from "./tileentities/TileEntityLoader";
import UnsupportedError from "./errors/UnsupportedError";
import World from "./World";
import Block from "./blocks/Block";

enum FileMagic {
	Chunk = 0xFC,
	Info = 0xFD,
	Player = 0xFE
}

const CHUNK_FILE_VERSION = 2;

export default class WorldSaveManager {
	private readonly worldFolderPath;
	private readonly globalDataPath;
	private readonly worldPlayerDataFolderPath;
	private readonly infoFilePath;

	private readonly config:Config;

	public worldCreationDate = new Date();
	public worldLastLoadDate = new Date();
	public worldSeed = Number.MIN_VALUE;

	public chunksOnDisk:FunkyArray<number, Array<number>>;
	public playerDataOnDisk:Array<string>;

	public constructor(config:Config, dimensions:Array<number>, numericalSeed:number) {
		this.chunksOnDisk = new FunkyArray<number, Array<number>>();
		this.playerDataOnDisk = new Array<string>();

		this.worldFolderPath = `./${config.worldName}`;
		this.worldPlayerDataFolderPath = `${this.worldFolderPath}/playerdata`;
		this.globalDataPath = `${this.worldFolderPath}/data`;
		this.infoFilePath = `${this.worldFolderPath}/info.hwd`;

		this.config = config;

		// Create world folder if it doesn't exist
		if (!existsSync(this.worldFolderPath)) {
			mkdirSync(this.worldFolderPath);
			mkdirSync(this.globalDataPath);
		}

		if (existsSync(this.infoFilePath)) {
			this.readInfoFile();
		} else {
			// World info file does not exist
			this.worldSeed = numericalSeed;
			this.createInfoFile(numericalSeed);
		}

		for (const dimension of dimensions) {
			const chunksArray = new Array<number>();
			this.chunksOnDisk.set(dimension, chunksArray);

			const dimensionFolderPath = `${this.worldFolderPath}/DIM${dimension}`
			if (!existsSync(dimensionFolderPath)) {
				mkdirSync(dimensionFolderPath);
				mkdirSync(`${dimensionFolderPath}/chunks`);
				mkdirSync(`${dimensionFolderPath}/data`);
			} else {
				const chunkFiles = readdirSync(`${dimensionFolderPath}/chunks`);
				for (const file of chunkFiles) {
					if (file.endsWith(".hwc")) {
						const name = file.split(".")[0];
						chunksArray.push(parseInt(name.startsWith("-") ? name.replace("-", "-0x") : `0x${name}`));
					}
				}
			}
		}

		if (!existsSync(this.worldPlayerDataFolderPath)) {
			mkdirSync(this.worldPlayerDataFolderPath);
		}

		const playerDataFiles = readdirSync(this.worldPlayerDataFolderPath);
		for (const dataFile of playerDataFiles) {
			if (dataFile.endsWith(".hpd")) {
				this.playerDataOnDisk.push(dataFile.replace(".hpd", ""));
			}
		}
	}

	private decompressDeflate(buffer:Buffer) {
		return new Promise<Buffer>((resolve, reject) => {
			inflate(buffer, (err, data) => {
				if (err) {
					return reject(err);
				}

				resolve(data);
			});
		});
	}

	private createInfoFile(numericalSeed:number) {
		const infoFileWriter = createWriter(Endian.BE, 26);
		infoFileWriter.writeUByte(FileMagic.Info); // Info File Magic
		infoFileWriter.writeUByte(2); // File Version
		infoFileWriter.writeLong(this.worldCreationDate.getTime()); // World creation date
		infoFileWriter.writeLong(this.worldLastLoadDate.getTime()); // Last load date
		infoFileWriter.writeLong(numericalSeed);
		writeFileSync(this.infoFilePath, infoFileWriter.toBuffer());
	}

	private readInfoFile() {
		const infoFileReader = createReader(Endian.BE, readFileSync(this.infoFilePath));
		const fileMagic = infoFileReader.readUByte();
		if (fileMagic !== FileMagic.Info) {
			throw new Error("World info file is invalid");
		}

		const fileVersion = infoFileReader.readByte();
		// v0, v1 and v2 all contain the same data apart from version numbers
		// All that changed between them was the folder format.
		if (fileVersion === 0 || fileVersion === 1 || fileVersion === 2) {
			this.worldCreationDate = new Date(Number(infoFileReader.readLong()));
			infoFileReader.readLong(); // Last load time is currently ignored
			this.worldSeed = Number(infoFileReader.readLong());

			// Upgrade v0 to v1
			if (fileVersion === 0) {
				Console.printInfo("Upgrading world to format v1 from v0");
				renameSync(`${this.worldFolderPath}/chunks`, `${this.worldFolderPath}/DIM0`);
				this.createInfoFile(this.worldSeed);
			}
			// Upgrade v1 to v2
			if (fileVersion === 1) {
				Console.printInfo("Upgrading world to format v2 from v1");
				const files = readdirSync(`${this.worldFolderPath}/`);
				for (const file of files) {
					if (file.startsWith("DIM")) {
						renameSync(`${this.worldFolderPath}/${file}`, `${this.worldFolderPath}/OLD${file}`);
						mkdirSync(`${this.worldFolderPath}/${file}`);
						mkdirSync(`${this.worldFolderPath}/${file}/data`);
						renameSync(`${this.worldFolderPath}/OLD${file}`, `${this.worldFolderPath}/${file}/chunks`);
					}
				}
				this.createInfoFile(this.worldSeed);
			}
		}
	}

	public writeChunkToDisk(chunk:Chunk) {
		return new Promise<boolean>(async (resolve, reject) => {
			const saveType = this.config.saveCompression;
			const chunkFileWriter = createWriter(Endian.BE, 10);
			chunkFileWriter.writeUByte(FileMagic.Chunk); // Chunk File Magic
			chunkFileWriter.writeUByte(CHUNK_FILE_VERSION); // File Version
			chunkFileWriter.writeUByte(saveType); // Save compression type
			chunkFileWriter.writeUByte(16); // Chunk X
			chunkFileWriter.writeUByte(128); // Chunk Y
			chunkFileWriter.writeUByte(16); // Chunk Z

			const chunkDataCombined = createWriter(Endian.BE)
				.writeBuffer(Buffer.from(chunk.getBlockData()))
				.writeBuffer(chunk.getMetadataBuffer())
				.writeBuffer(chunk.getBlockLightBuffer())
				.writeBuffer(chunk.getSkyLightBuffer());

			chunkDataCombined.writeUShort(chunk.tileEntities.length);
			await chunk.tileEntities.forEach(tileEntity => {
				tileEntity.toSave(chunkDataCombined);
			});

			const chunkData = chunkDataCombined.toBuffer();

			const codArr = this.chunksOnDisk.get(chunk.world.dimension);
			if (saveType === SaveCompressionType.NONE) {
				chunkFileWriter.writeInt(chunkData.length); // Data length
				chunkFileWriter.writeBuffer(chunkData); // Chunk data

				writeFile(`${this.worldFolderPath}/DIM${chunk.world.dimension}/chunks/${Chunk.CreateCoordPair(chunk.x, chunk.z).toString(16)}.hwc`, chunkFileWriter.toBuffer(), () => {
					const cPair = Chunk.CreateCoordPair(chunk.x, chunk.z);
					
					if (!codArr?.includes(cPair)) {
						codArr?.push(cPair);
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

					writeFile(`${this.worldFolderPath}/DIM${chunk.world.dimension}/chunks/${Chunk.CreateCoordPair(chunk.x, chunk.z).toString(16)}.hwc`, chunkFileWriter.toBuffer(), () => {
						const cPair = Chunk.CreateCoordPair(chunk.x, chunk.z);
						if (!codArr?.includes(cPair)) {
							codArr?.push(cPair);
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
			readFile(`${this.worldFolderPath}/DIM${world.dimension}/chunks/${Chunk.CreateCoordPair(x, z).toString(16)}.hwc`, async (err, data) => {
				if (err) {
					return reject(err);
				}

				const chunkFileReader = createReader(Endian.BE, data);
				
				// Check file validity
				if (chunkFileReader.readUByte() !== FileMagic.Chunk) {
					return reject(new Error("Chunk file is invalid"));
				}

				const fileVersion = chunkFileReader.readUByte();
				if (fileVersion === 0 || fileVersion === 1 || fileVersion === 2) {
					const saveCompressionType:SaveCompressionType = chunkFileReader.readUByte();
					const chunkX = chunkFileReader.readUByte();
					const chunkY = chunkFileReader.readUByte();
					const chunkZ = chunkFileReader.readUByte();
					const chunkDataByteSize = chunkX * chunkZ * chunkY;

					const contentLength = chunkFileReader.readInt();
					let chunkData: IReader;
					if (saveCompressionType === SaveCompressionType.NONE) {
						chunkData = createReader(Endian.BE, chunkFileReader.readBuffer(contentLength));
					} else if (saveCompressionType === SaveCompressionType.DEFLATE) {
						chunkData = createReader(Endian.BE, await this.decompressDeflate(chunkFileReader.readBuffer(contentLength)));
					} else {
						throw new UnsupportedError(`Unsupported chunk compression type`);
					}

					let chunk:Chunk;
					if (fileVersion === 0) {
						chunk = new Chunk(
							world, x, z,
							chunkData.readUint8Array(chunkDataByteSize),    // Block Data
							chunkData.readUint8Array(chunkDataByteSize / 2) // Block Metadata
						);
					} else if (fileVersion === 1 || fileVersion === 2) {
						chunk = new Chunk(
							world, x, z,
							chunkData.readUint8Array(chunkDataByteSize),     // Block Data
							chunkData.readUint8Array(chunkDataByteSize / 2), // Block Metadata
							chunkData.readUint8Array(chunkDataByteSize / 2), // Block Light
							chunkData.readUint8Array(chunkDataByteSize / 2)  // Sky Light
						);
					} else {
						throw new UnsupportedError(`Unsupported save file version: ${fileVersion}`);
					}

					if (fileVersion === 2) {
						const tileEntityCount = chunkData.readUShort();
						for (let i = 0; i < tileEntityCount; i++) {
							const tileEntity = TileEntityLoader.FromSave(chunkData);
							const blockAtTileEntity = chunk.getBlockId(tileEntity.pos.x, tileEntity.pos.y, tileEntity.pos.z);
							if (blockAtTileEntity === tileEntity.forBlock.blockId) {
								chunk.tileEntities.set(tileEntity.pos.x << 11 | tileEntity.pos.z << 7 | tileEntity.pos.y, tileEntity);
							} else {
								Console.printWarn(`Tile entity in chunk ${chunk.x},${chunk.z} block ${tileEntity.pos} has no associated block of type ${tileEntity.forBlock.blockName}, instead found ${Block.blockNames[blockAtTileEntity] ?? "Air"}. Skipping...`);
							}
						}
					}

					resolve(chunk);
				} else {
					throw new UnsupportedError(`Unsupported save file version: ${fileVersion}`);
				}
			});
		});
	}

	writePlayerSaveToDisk(username:string, playerData:IWriter) {
		return new Promise<boolean>((resolve, reject) => {
			const playerDataWriter = createWriter(Endian.BE);
			playerDataWriter.writeUByte(FileMagic.Player); // File magic
			playerDataWriter.writeUByte(0); // File version
			playerDataWriter.writeBuffer(playerData.toBuffer()); // Player data

			writeFile(`${this.worldPlayerDataFolderPath}/${username}.hpd`, playerDataWriter.toBuffer(), (err) => {
				if (err) {
					return reject(err);
				}

				if (!this.playerDataOnDisk.includes(username)) {
					this.playerDataOnDisk.push(username);
				}

				resolve(true);
			})
		});
	}

	readPlayerDataFromDisk(username:string) {
		return new Promise<IReader>((resolve, reject) => {
			readFile(`${this.worldPlayerDataFolderPath}/${username}.hpd`, (err, data) => {
				if (err) {
					return reject(err);
				}

				const reader = createReader(Endian.BE, data);
				if (reader.readUByte() !== FileMagic.Player) {
					return reject(new Error("Player data file is invalid"));
				}

				const fileVersion = reader.readUByte();
				if (fileVersion === 0) {
					resolve(reader);
				}
			});
		});
	}
}