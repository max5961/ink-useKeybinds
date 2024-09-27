import { KeyBinds } from "../../use-keybinds/useKeybinds.js";

export const NAVIGATOR_EVENTS = {
    up: "NAVIGATOR_UP",
    down: "NAVIGATOR_DOWN",
    left: "NAVIGATOR_LEFT",
    right: "NAVIGATOR_RIGHT",
    next: "NAVIGATOR_NEXT",
    prev: "NAVIGATOR_PREV",
};

export const viKeybinds = {
    [NAVIGATOR_EVENTS.up]: [{ key: "up" }, { input: "k" }],
    [NAVIGATOR_EVENTS.down]: [{ key: "down" }, { input: "j" }],
    [NAVIGATOR_EVENTS.left]: [{ key: "left" }, { input: "h" }],
    [NAVIGATOR_EVENTS.right]: [{ key: "right" }, { input: "l" }],
    [NAVIGATOR_EVENTS.next]: [{ key: "right" }, { key: "tab" }],
    [NAVIGATOR_EVENTS.prev]: [{ key: "left" }],
} satisfies KeyBinds;

export const arrowKeybinds = {
    [NAVIGATOR_EVENTS.up]: { key: "up" },
    [NAVIGATOR_EVENTS.down]: { key: "down" },
    [NAVIGATOR_EVENTS.left]: { key: "left" },
    [NAVIGATOR_EVENTS.right]: { key: "right" },
    [NAVIGATOR_EVENTS.next]: [{ key: "right" }, { key: "tab" }],
    [NAVIGATOR_EVENTS.prev]: [{ key: "left" }],
} satisfies KeyBinds;
