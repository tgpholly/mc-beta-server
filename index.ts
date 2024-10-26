import { readFileSync } from "fs";
import { Console } from "hsconsole";
import Config from "./config";
import MinecraftServer from "./server/MinecraftServer";
import SaveCompressionType from "./server/enums/SaveCompressionType";

const tempConfig = JSON.parse(readFileSync("./config.json").toString());
tempConfig.saveCompression = SaveCompressionType[tempConfig.saveCompression];
const config:Config = tempConfig as Config;

Console.customHeader(`MC Beta Server started at ${new Date()}`);

new MinecraftServer(config);