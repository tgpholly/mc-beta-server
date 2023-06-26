// fileSmasher ~.~
// for when you're just too lazy to
// do it properly.

import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";

let tsFileData:Array<string> = new Array<string>();
const tsFirstFileData:Array<string> = new Array<string>();
const tsLastFileData:Array<string> = new Array<string>();
const tsEverythingElse:Array<string> = new Array<string>();

function readDir(nam:string) {
	const files = readdirSync(nam);
	for (const file of files) {
		if (nam == "./" && (file.startsWith(".") || file == "tooling" || file == "build" || file == "node_modules" || file == "combined.ts")) {
			continue;
		}

		// This is a very dumb way of checking for folders
		// protip: don't do this.
		if (statSync(`${nam}/${file}`).size == 0) {
			readDir(`${nam}/${file}`);
		} else if (file.endsWith(".ts")) {
			if (file == "index.ts") {
				tsLastFileData.push(readFileSync((`${nam}/${file}`).replace("//", "/")).toString());
			} else if (nam.includes("enum")) {
				tsFirstFileData.push(readFileSync((`${nam}/${file}`).replace("//", "/")).toString());
			} else {
				tsEverythingElse.push(readFileSync((`${nam}/${file}`).replace("//", "/")).toString());
			}
		}
	}
}

readDir("./");

tsFileData = tsFileData.concat(tsFirstFileData).concat(tsEverythingElse).concat(tsLastFileData);

const combinedFiles = tsFileData.join("\n");

const splitLines = combinedFiles.split("\n");
const resultLines:Array<string> = new Array<string>();

// Insert allowed imports
resultLines.push(`import chalk from "chalk";
import { createWriteStream, mkdirSync, existsSync, readFileSync, readFile, writeFile, writeFileSync, readdirSync } from "fs";
import { deflate, inflate } from "zlib";
import { createWriter, createReader, IReader, Endian } from "bufferstuff";
import { Server, Socket } from "net";`);

// Let's process the file to make it usable
for (const line of splitLines) {
	// Throw away imports as they aren't needed
	// TODO: Add allow list for npm module imports
	if (line.startsWith("import")) {
		continue;
	}
	// Fix up classes, interfaces and such.
	//resultLines.push(line);
	resultLines.push(line.replace("export class", "class").replace("export interface", "interface").replace("export enum", "enum").replace("export type", "type"));
}

writeFileSync("./combined.ts", resultLines.join("\n"));