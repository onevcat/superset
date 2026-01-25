import type { Theme } from "../types";

/**
 * Kanagawa Bones theme - A muted, earthy dark theme inspired by Japanese ink wash
 */
export const kanagawaBonesTheme: Theme = {
	id: "kanagawa-bones",
	name: "Kanagawa Bones",
	author: "mbadolato",
	type: "dark",
	isBuiltIn: true,
	description: "A muted, earthy dark theme inspired by Japanese aesthetics",

	ui: {
		background: "#1F1F28",
		foreground: "#DDD8BB",
		card: "#2A2A37",
		cardForeground: "#DDD8BB",
		popover: "#2A2A37",
		popoverForeground: "#DDD8BB",
		primary: "#98BC9A",
		primaryForeground: "#1F1F28",
		secondary: "#2A2A37",
		secondaryForeground: "#DDD8BB",
		muted: "#2A2A37",
		mutedForeground: "#A8A497",
		accent: "#49474A",
		accentForeground: "#DDD8BB",
		tertiary: "#16161D",
		tertiaryActive: "#2A2A37",
		destructive: "#E46A6E",
		destructiveForeground: "#DDD8BB",
		border: "#49474A",
		input: "#49474A",
		ring: "#98BC9A",
		sidebar: "#16161D",
		sidebarForeground: "#DDD8BB",
		sidebarPrimary: "#98BC9A",
		sidebarPrimaryForeground: "#1F1F28",
		sidebarAccent: "#2A2A37",
		sidebarAccentForeground: "#DDD8BB",
		sidebarBorder: "#49474A",
		sidebarRing: "#98BC9A",
		chart1: "#E46A6E",
		chart2: "#98BC9A",
		chart3: "#7EB4CA",
		chart4: "#E5C26D",
		chart5: "#9680B8",
	},

	terminal: {
		background: "#1F1F28",
		foreground: "#DDD8BB",
		cursor: "#E6E0C2",
		cursorAccent: "#1F1F28",
		selectionBackground: "rgba(73, 71, 62, 0.6)",

		// Standard ANSI colors
		black: "#1F1F28",
		red: "#E46A78",
		green: "#98BC6D",
		yellow: "#E5C283",
		blue: "#7EB3C9",
		magenta: "#9580B8",
		cyan: "#7EB3C9",
		white: "#DDD8BB",

		// Bright variants
		brightBlack: "#3C3C51",
		brightRed: "#EC818C",
		brightGreen: "#9EC967",
		brightYellow: "#F1C982",
		brightBlue: "#7BC2DF",
		brightMagenta: "#A98FD2",
		brightCyan: "#7BC2DF",
		brightWhite: "#A8A48D",
	},
};
