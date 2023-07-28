import * as dyetty from "dyetty";
import { createWriteStream, mkdirSync, existsSync } from "fs";

console.clear();

enum LogType {
	INFO,
	WARN,
	ERROR
}

enum LogTag {
	INFO,
	CHAT,
	WARN,
	ERROR
}

const LogTags = [
	dyetty.bgGreen(dyetty.black("  INFO  ")),
	dyetty.bgCyan(dyetty.black("  CHAT  ")),
	dyetty.bgYellow(dyetty.black("  WARN  ")),
	dyetty.bgRed(" ERRR ")
] as const;

const TagsForFile = [
	"[INFO]",
	"[CHAT]",
	"[WARN]",
	"[ERRR]"
] as const;

function correctValue(i:number) : string {
	if (i <= 9) return `0${i}`;
	else return i.toString();
}

function getTime() : string {
	const time = new Date();
	return `[${correctValue(time.getHours())}:${correctValue(time.getMinutes())}:${correctValue(time.getSeconds())}]`;
}

function log(tag:LogTag, log:string, logType:LogType = LogType.INFO) : void {
	const stringTime = getTime(),
		  fileTag = TagsForFile[tag],
		  consoleTag = LogTags[tag];

	Console.QUEUED_FOR_LOG += `${stringTime} ${fileTag} ${log}\n`;
	switch (logType) {
		case LogType.INFO:
			return console.log(`${dyetty.green(stringTime)} ${consoleTag} ${log}`);
		case LogType.WARN:
			return console.warn(`${dyetty.green(stringTime)} ${consoleTag} ${log}`);
		case LogType.ERROR:
			return console.error(`${dyetty.green(stringTime)} ${consoleTag} ${log}`);
	}
}

// TODO: Keep old logs, rename on startup using file header?
if (!existsSync("./logs")) {
	mkdirSync("./logs/");
}

export class Console {
	public static QUEUED_FOR_LOG:string = "";
	private static logFileWriteStream = createWriteStream("./logs/latest.log");
	private static flushTimer:NodeJS.Timer = setInterval(() => {
		if (Console.QUEUED_FOR_LOG.length !== 0) {
			const strRef = Console.QUEUED_FOR_LOG;
			Console.QUEUED_FOR_LOG = "";
			Console.logFileWriteStream.write(strRef);
		}
	}, 1000 * 10);

	public static printInfo(s:string) : void {
		log(LogTag.INFO, s);
	}

	public static printChat(s:string) : void {
		log(LogTag.CHAT, s);
	}

	public static printWarn(s:string) : void {
		log(LogTag.WARN, s, LogType.WARN);
	}

	public static printError(s:string) : void {
		log(LogTag.ERROR, s, LogType.ERROR);
	}
}