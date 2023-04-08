import chalk from "chalk";

console.clear();

enum LogType {
	INFO,
	WARN,
	ERROR
};

const LogTags = {
	INFO: chalk.bgGreen(chalk.black("  INFO  ")),
	BANCHO: chalk.bgMagenta(chalk.black(" BANCHO ")),
	WEBREQ: chalk.bgGreen(chalk.black(" WEBREQ ")),
	CHAT: chalk.bgCyan(chalk.black("  CHAT  ")),
	WARN: chalk.bgYellow(chalk.black("  WARN  ")),
	ERROR: chalk.bgRed("  ERRR  "),
	REDIS: chalk.bgRed(chalk.white(" bREDIS ")),
	STREAM: chalk.bgBlue(chalk.black(" STREAM "))
} as const;

function correctValue(i:number) : string {
	if (i <= 9) return `0${i}`;
	else return i.toString();
}

function getTime() : string {
	const time = new Date();
	return chalk.green(`[${correctValue(time.getHours())}:${correctValue(time.getMinutes())}:${correctValue(time.getSeconds())}]`);
}

function log(tag:string, log:string, logType:LogType = LogType.INFO) : void {
	switch (logType) {
		case LogType.INFO:
			return console.log(`${getTime()} ${tag} ${log}`);
		case LogType.WARN:
			return console.warn(`${getTime()} ${tag} ${log}`);
		case LogType.ERROR:
			return console.error(`${getTime()} ${tag} ${log}`);
	}
}

export class Console {
	public static printWebReq(s:string) : void {
		log(LogTags.WEBREQ, s);
	}

	public static printStream(s:string) : void {
		log(LogTags.STREAM, s);
	}

	public static printInfo(s:string) : void {
		log(LogTags.INFO, s);
	}

	public static printChat(s:string) : void {
		log(LogTags.CHAT, s);
	}

	public static printWarn(s:string) : void {
		log(LogTags.WARN, s);
	}

	public static printError(s:string) : void {
		log(LogTags.ERROR, s);
	}
}