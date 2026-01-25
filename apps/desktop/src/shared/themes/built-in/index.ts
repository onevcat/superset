import type { Theme } from "../types";
import { darkTheme } from "./dark";
import { emberTheme } from "./ember";
import { kanagawaBonesTheme } from "./kanagawa-bones";
import { lightTheme } from "./light";
import { monokaiTheme } from "./monokai";
import { oneDarkTheme } from "./one-dark";

/**
 * All built-in themes
 */
export const builtInThemes: Theme[] = [
	darkTheme,
	lightTheme,
	emberTheme,
	kanagawaBonesTheme,
	monokaiTheme,
	oneDarkTheme,
];

/**
 * Default theme ID
 */
export const DEFAULT_THEME_ID = "dark";

/**
 * Get a built-in theme by ID
 */
export function getBuiltInTheme(id: string): Theme | undefined {
	return builtInThemes.find((theme) => theme.id === id);
}

// Re-export individual themes
export {
	darkTheme,
	emberTheme,
	kanagawaBonesTheme,
	lightTheme,
	monokaiTheme,
	oneDarkTheme,
};
