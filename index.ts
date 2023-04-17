import { Config } from "./config";
import { readFileSync } from "fs";
import { MinecraftServer } from "./server/MinecraftServer";
import { SaveCompressionType } from "./server/enums/SaveCompressionType";
const tempConfig = JSON.parse(readFileSync("./config.json").toString());
tempConfig.saveCompression = SaveCompressionType[tempConfig.saveCompression];
const config:Config = tempConfig as Config;

new MinecraftServer(config);