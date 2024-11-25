import * as dyetty from "dyetty";

export default abstract class TextColorParser {
	public static ParseConsole(text: string) {
		if (!text.includes("§")) {
			return text;
		}
		const colorParts = text.split("§");
		for (let i = 1; i < colorParts.length; i++) {
			const raw = colorParts[i];
			const color = raw.slice(0, 1).toLowerCase();
			const text = raw.slice(1);
			switch (color) {
				case "4": colorParts[i] = dyetty.red(text); break;
				case "c": colorParts[i] = dyetty.redBright(text); break;
				case "e": colorParts[i] = dyetty.yellowBright(text); break;
				case "6": colorParts[i] = dyetty.yellow(text); break;
				case "2": colorParts[i] = dyetty.green(text); break;
				case "1": colorParts[i] = dyetty.blue(text); break;
				case "a": colorParts[i] = dyetty.greenBright(text); break;
				case "b": colorParts[i] = dyetty.blueBright(text); break;
				case "3": colorParts[i] = dyetty.cyan(text); break;
				case "9": colorParts[i] = dyetty.blue(text); break;
				case "d": colorParts[i] = dyetty.magentaBright(text); break;
				case "5": colorParts[i] = dyetty.magenta(text); break;
				case "f": colorParts[i] = dyetty.white(text); break;
				case "7":
				case "8":
					colorParts[i] = dyetty.gray(text);
					break;
				case "0": colorParts[i] = dyetty.black(text); break;
			}
		}

		return colorParts.join("");
	}
}