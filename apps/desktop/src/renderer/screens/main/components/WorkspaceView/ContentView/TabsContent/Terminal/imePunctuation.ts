import type { Terminal as XTerm } from "@xterm/xterm";

const IME_PUNCT_FLAG_KEY = "SUPERSET_TERMINAL_IME_PUNCT";
const IME_PUNCTUATION_PATTERN = /[，。、？！：；（）【】《》、,.?!:;()[\]<>\\]/u;

/**
 * Punctuation keys that should prefer the native `input` event path.
 * The values are documentation-oriented; we only need the keys at runtime.
 */
export const HALFWIDTH_TO_FULLWIDTH_PUNCTUATION: Record<string, string> = {
	",": "，",
	".": "。",
	"?": "？",
	"!": "！",
	":": "：",
	";": "；",
	"'": "'",
	"(": "（",
	")": "）",
	"[": "【",
	"]": "】",
	"<": "《",
	">": "》",
	"\\": "、",
};

export function isImePunctuationPassthroughEnabled(): boolean {
	try {
		if (typeof localStorage === "undefined") return true;
		return localStorage.getItem(IME_PUNCT_FLAG_KEY) !== "0";
	} catch {
		return true;
	}
}

export type ImePunctuationController = {
	onImePunctuationKeydown: () => void;
	handleOnData: (data: string) => void;
	cleanup: () => void;
};

export function setupImePunctuationPassthrough({
	xterm,
	onWrite,
}: {
	xterm: XTerm;
	onWrite: (data: string) => void;
}): ImePunctuationController {
	let seq = 0;
	let pendingSeq = 0;
	let handledSeq = 0;
	let compositionActive = false;

	const markPending = (): void => {
		if (!isImePunctuationPassthroughEnabled()) return;
		seq += 1;
		pendingSeq = seq;
	};

	const handleOnData = (data: string): void => {
		if (!isImePunctuationPassthroughEnabled()) return;
		if (!IME_PUNCTUATION_PATTERN.test(data)) return;
		if (pendingSeq > handledSeq) {
			handledSeq = pendingSeq;
		}
	};

	let cleanup = (): void => {};
	const textarea = xterm.textarea;
	if (textarea) {
		const onCompositionStart = (): void => {
			compositionActive = true;
		};
		const onCompositionEnd = (): void => {
			compositionActive = false;
		};
		const onInput = (event: Event): void => {
			if (!isImePunctuationPassthroughEnabled()) return;
			// If the IME is in an active composition session (e.g. Japanese IME),
			// let xterm.js handle the commit to avoid duplicate writes.
			if (compositionActive) return;
			const inputEvent = event as InputEvent;
			const data = inputEvent.data;
			if (!data || !IME_PUNCTUATION_PATTERN.test(data)) return;

			const currentSeq = pendingSeq || ++seq;
			pendingSeq = currentSeq;

			queueMicrotask(() => {
				const wasHandledByXterm = handledSeq === currentSeq;
				if (!wasHandledByXterm) {
					onWrite(data);
				}
				if (pendingSeq === currentSeq) {
					pendingSeq = 0;
				}
			});
		};

		textarea.addEventListener("compositionstart", onCompositionStart);
		textarea.addEventListener("compositionend", onCompositionEnd);
		textarea.addEventListener("input", onInput);
		cleanup = () => {
			textarea.removeEventListener("compositionstart", onCompositionStart);
			textarea.removeEventListener("compositionend", onCompositionEnd);
			textarea.removeEventListener("input", onInput);
		};
	}

	return {
		onImePunctuationKeydown: markPending,
		handleOnData,
		cleanup,
	};
}
