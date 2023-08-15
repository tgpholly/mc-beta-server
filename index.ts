import { Config } from "./config";
import { Console } from "hsconsole";
import { readFileSync } from "fs";
import { MinecraftServer } from "./server/MinecraftServer";
import { SaveCompressionType } from "./server/enums/SaveCompressionType";
const tempConfig = JSON.parse(readFileSync("./config.json").toString());
tempConfig.saveCompression = SaveCompressionType[tempConfig.saveCompression];
const config:Config = tempConfig as Config;

Console.customHeader(`MC Beta Server started at ${new Date()}`);

new MinecraftServer(config);