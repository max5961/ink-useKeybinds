import EventEmitter from "events";
import { Binding, KbConfig } from "./useKeybinds.js";
import { StringDecoder } from "string_decoder";

const ESCAPE_KEY = "\u001B";

const EVT = {
    stdIn: "STD_IN",
    charDown: "CHAR_DOWN",
    appStatus: "APP_STATUS",
    keypress: "keypress",
    data: "data",
} as const;

const emitter = new EventEmitter();
emitter.setMaxListeners(5);

export const hookDebugEmitter = new EventEmitter();

const inputState: InputState = {
    listening: false,
    charRegister: "",
    keyRegister: newKeyRegister(),
    command: null,
    shouldProcess: true,
    lastCharKey: null,
    override: false,
};

/* public */
function subscribe(
    event: typeof EVT.stdIn | typeof EVT.charDown,
    listener: () => any,
): () => void {
    emitter.addListener(event, listener);

    return () => {
        emitter.removeListener(event, listener);
        /* Will pause listening if there are no current active STD_IN or CHAR_DOWN
         * listeners. Most of the time listeners will be re-added synchronously
         * immediately after so listening won't be paused. */

        // Need to think about which one of these is safer
        setImmediate(() => emitter.emit(EVT.appStatus));
        // emitter.emit(EVT.appStatus);
    };
}

/* public */
function getCommand(): string | null {
    return inputState.command;
}

/* public */
function getCharRegister(): string {
    return inputState.charRegister;
}

function setCommand(command: string): void {
    inputState.command = command;
    inputState.charRegister = "";
}

function getLastCharKey(): string | null {
    return inputState.lastCharKey;
}

function pushRegister(s: string): void {
    if (inputState.charRegister.length >= 2) {
        inputState.charRegister = "";
    }

    inputState.charRegister += s;
}

/* public
 * This might be helpful for temporarily pausing all STD_IN events, but still
 * keep the stream going. */
function setShouldProcess(b: boolean): void {
    inputState.shouldProcess = b;
}

/* useKeybinds(altConfig, { overrideOthers: true })
 * Processes ONLY this config, or any others that have the same settings.  This
 * would be helpful for switching between modes such as when you need to process
 * text input in a form, you would want to make sure you didn't have any conflicting
 * keybinds */
function overrideConfig(config: KbConfig, override: boolean) {
    inputState.override = override;
    processConfig(config, true);

    return () => {
        inputState.override = !inputState.override;
    };
}

/* public */
function processConfig(config: KbConfig, override: boolean = false): void {
    if (!inputState.shouldProcess || (!override && inputState.override)) return;

    for (const command in config) {
        const binding = config[command];

        let match: boolean = false;
        if (Array.isArray(binding)) {
            match = binding.some((b) => checkMatch(b));
        } else {
            match = checkMatch(binding);
        }

        if (match) return setCommand(command);
    }
}

function checkMatch(binding: Binding): boolean {
    // Prevent ctrl + f triggering 'f' for example
    if (inputState.keyRegister.ctrl) {
        if (binding.key && binding.input) {
            return (
                inputState.keyRegister[binding.key] &&
                inputState.charRegister === binding.input
            );
        }

        // Special key only
        if (binding.key && !binding.input) {
            return inputState.keyRegister[binding.key];
        }

        return false;
    }

    if (binding.key && binding.input) {
        return (
            inputState.keyRegister[binding.key] &&
            inputState.charRegister === binding.input
        );
    }

    // Char input only
    if (!binding.key && binding.input) {
        return inputState.charRegister === binding.input;
    }

    return false;
}

function handleKeypress(input: string, key: ReadlineKey): void {
    inputState.command = null;
    inputState.lastCharKey = null;

    // SIGINT
    if (key.ctrl && input === "c") {
        emitter.removeAllListeners();
        process.stdin.pause();
        process.exit();
    }

    /* Update state then process the state */
    if (input) {
        pushRegister(input);
        inputState.lastCharKey = input;
        emitter.emit(EVT.charDown);
    }

    inputState.keyRegister = {
        esc: false,
        ctrl: key.ctrl,
        backspace: key.name === "backspace",
        return: key.name === "return",
        delete: key.name === "delete",
        tab: key.name === "tab",
        up: key.name === "up",
        down: key.name === "down",
        left: key.name === "left",
        right: key.name === "right",
    } satisfies Key;

    emitter.emit(EVT.stdIn);
}

/* emitKeypressEvents has a significant delay when processing ESC keypresses
 * so this is the callback for the process.stdin.on("data", cb); instead which
 * processes it normally. */
function handleEscKeypress(key: string): void {
    inputState.command = null;

    if (key === "\u0003") {
        process.exit();
    }

    if (key !== ESCAPE_KEY) {
        return;
    }

    /* Clear register and keyRegister for ESC only */
    inputState.charRegister = "";
    inputState.keyRegister = { ...newKeyRegister(), esc: true };

    emitter.emit(EVT.stdIn);
}

/* public */
function listen(): void {
    if (inputState.listening) {
        return;
    }

    process.stdin.on(EVT.keypress, handleKeypress);
    process.stdin.on(EVT.data, handleEscKeypress);
    emitter.on(EVT.appStatus, handleAppStatus);

    inputState.listening = true;
}

function pause(): void {
    process.stdin.removeListener(EVT.keypress, handleKeypress);
    process.stdin.removeListener(EVT.data, handleEscKeypress);
    emitter.removeListener(EVT.appStatus, handleAppStatus);

    inputState.listening = false;

    const dataCount = process.stdin.listenerCount(EVT.data);
    const keypressCount = process.stdin.listenerCount(EVT.keypress);

    if (dataCount <= 1 && !keypressCount) {
        process.stdin.pause();
    }
}

/* When the app exits whether intentionally or by an error, all components unmount
 * and the useKeybinds hook makes sure all listeners are cleaned up on unmount.
 * Without removing all listeners, the node process won't end by itself */
function handleAppStatus(): void {
    const stdInListeners = emitter.listeners(EVT.stdIn).length;
    const charDownListeners = emitter.listeners(EVT.charDown).length;

    if (!stdInListeners && !charDownListeners) {
        pause();
    }
}

function newKeyRegister(): Key {
    return {
        esc: false,
        ctrl: false,
        backspace: false,
        return: false,
        delete: false,
        tab: false,
        up: false,
        down: false,
        left: false,
        right: false,
    };
}

const KeypressRegister = {
    subscribe,
    processConfig,
    overrideConfig,
    getCommand,
    getCharRegister,
    getLastCharKey,
    setShouldProcess,
    listen,
};

export default KeypressRegister;

type InputState = {
    listening: boolean;
    shouldProcess: boolean;
    charRegister: string;
    keyRegister: Key;
    command: string | null;
    lastCharKey: string | null;
    override: boolean;
};

export type Key = { [P in KeyName]: boolean };
type ReadlineKey = { name: KeyName; ctrl: boolean };
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
