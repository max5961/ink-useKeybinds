import { KeyBinds } from "../../use-keybinds/useKeybinds.js";

const arrow = {
    increment: [{ key: "down" }, { key: "tab" }],
    decrement: [{ key: "up" }],
} satisfies KeyBinds;

const vim = {
    increment: [{ input: "j" }, { key: "down" }, { key: "tab" }],
    decrement: [{ input: "k" }, { key: "up" }],
    scroll_up: { key: "ctrl", input: "u" },
    scroll_down: { key: "ctrl", input: "d" },
    goToTop: { input: "gg" },
    goToBottom: { input: "G" },
} satisfies KeyBinds;

export const ListKeybinds = {
    arrow,
    vim,
};
