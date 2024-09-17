import { KeyBinds } from "../../../use-keybinds/useKeybinds.js";

const arrowVertical = {
    increment: [{ key: "down" }, { key: "tab" }],
    decrement: [{ key: "up" }],
} satisfies KeyBinds;

const arrowHorizontal = {
    increment: [{ key: "right" }, { key: "tab" }],
    decrement: [{ key: "left" }],
} satisfies KeyBinds;

const vimVertical = {
    increment: [{ input: "j" }, { key: "down" }, { key: "tab" }],
    decrement: [{ input: "k" }, { key: "up" }],
    scroll_up: { key: "ctrl", input: "u" },
    scroll_down: { key: "ctrl", input: "d" },
    goToTop: { input: "gg" },
    goToBottom: { input: "G" },
} satisfies KeyBinds;

const vimHorizontal = {
    ...vimVertical,
    increment: [{ input: "l" }, { key: "right" }, { key: "tab" }],
    decrement: [{ input: "h" }, { key: "left" }],
} satisfies KeyBinds;

export const ListKeybinds = {
    arrowVertical,
    arrowHorizontal,
    vimVertical,
    vimHorizontal,
};
