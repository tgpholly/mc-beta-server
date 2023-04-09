import { Config } from "./config";
import { readFileSync } from "fs";
import { MinecraftServer } from "./server/MinecraftServer";
const config:Config = JSON.parse(readFileSync("./config.json").toString()) as Config;

new MinecraftServer(config);