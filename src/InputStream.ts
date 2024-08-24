import { emitKeypressEvents } from "readline";
import EventEmitter from "events";
import { KeyBinds } from "./Keybinds.js";

emitKeypressEvents(process.stdin);

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf-8");

export const StdInEmitter = new EventEmitter();
// Keep this at a very low amount for devel to make sure listeners are being removed
// properly, but should be much higher during production.  Also consider creating
// an entirely new EventEmitter just for the hook to keep listeners count specific
// to hook instances
StdInEmitter.setMaxListeners(5);

setInterval(() => {
    StdInEmitter.emit("IS_RENDER");
}, 75);

/* Prevent any hangups from the App crashing for example */
StdInEmitter.on("IS_RENDER", () => {
    if (StdInEmitter.listeners("NEW_DATA").length === 0) {
        StdInEmitter.removeAllListeners();
        process.stdin.pause();
        process.exit();
    }
});

process.stdin.on("keypress", (input: string, key: ReadlineKey) => {
    if (key.ctrl && key.name === "c") {
        StdInEmitter.removeAllListeners();
        process.stdin.pause();
        process.exit();
    }

    const nonAlphanumericMap = {
        ctrl: key.ctrl,
        backspace: key.name === "backspace",
        return: key.name === "return",
        delete: key.name === "delete",
        tab: key.name === "tab",
        up: key.name === "up",
        down: key.name === "down",
        left: key.name === "left",
        right: key.name === "right",
    } satisfies Omit<Key, "esc">;

    StdInEmitter.emit("INPUT", input, nonAlphanumericMap);
});

/* For some reason emitKeyPressEvents stream has a significant delay for Esc, so
 * this is the workaround */
process.stdin.on("data", (key: string) => {
    if (StdInEmitter.listeners("NEW_DATA").length === 0) {
        process.exit();
    }
    if (key === "\u001B") {
        // Clear all register and key entries
        StdInEmitter.emit("ESCAPE", true);
    }
});

export const KB = new KeyBinds(StdInEmitter);
StdInEmitter.on("INPUT", KB.handleStdin.bind(KB));
StdInEmitter.on("ESCAPE", KB.handleEscStdin.bind(KB));

type ReadlineKey = { name: KeyName | "c"; ctrl: boolean };
export type Key = { [P in KeyName]: boolean };
type KeyName =
    | "ctrl"
    | "backspace"
    | "delete"
    | "tab"
    | "up"
    | "down"
    | "left"
    | "right"
    | "return"
    | "esc";
