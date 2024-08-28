import EventEmitter from "events";
import { Binding, KbConfig } from "./useKeybinds.js";
import { HEX_MAP, newKeyRegister, NonAlphaKeys } from "./HexMap.js";

type InputState = {
    listening: boolean;
    shouldProcess: boolean;
    charRegister: string;
    keyRegister: NonAlphaKeys;
    command: string | null;
    lastCharKey: string | null;
    override: boolean;
};

const inputState: InputState = {
    listening: false,
    charRegister: "",
    keyRegister: newKeyRegister(),
    command: null,
    shouldProcess: true,
    lastCharKey: null,
    override: false,
};

export const EVT = {
    keypress: "KEYPRESS",
    appStatus: "APP_STATUS",
    readable: "readable",
} as const;

const EMITTER = new EventEmitter();
EMITTER.setMaxListeners(5);

/* public */
function subscribe(
    event: typeof EVT.keypress,
    listener: () => unknown,
): () => void {
    EMITTER.addListener(event, listener);

    return () => {
        EMITTER.removeListener(event, listener);
        /* Will pause listening if there are no current active STD_IN or CHAR_DOWN
         * listeners. Most of the time listeners will be re-added synchronously
         * immediately after so listening won't be paused. */

        // Need to think about which one of these is safer
        setImmediate(() => EMITTER.emit(EVT.appStatus));
        // EMITTER.emit(EVT.appStatus);
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

function pushCharRegister(s: string): void {
    if (s === "") return;

    if (inputState.charRegister.length >= 2) {
        inputState.charRegister = "";
    }

    inputState.charRegister += s;
}

function replaceKeyRegister(mapping: NonAlphaKeys): void {
    inputState.keyRegister = mapping;
}

/* public */
function processConfig(config: KbConfig): void {
    if (!inputState.shouldProcess) return;

    /* Is there a non alphanumeric keypress?  We need to know so that bindings
     * such as just "f" should not trigger ctrl + f for example. */
    const hasNonAlphaKey = Object.values(inputState.keyRegister).some((b) => b);

    for (const command in config) {
        const binding = config[command];

        let match = false;
        if (Array.isArray(binding)) {
            match = binding.some((b) => checkMatch(b, hasNonAlphaKey));
        } else {
            match = checkMatch(binding, hasNonAlphaKey);
        }

        if (match) return setCommand(command);
    }
}

function checkMatch(binding: Binding, hasNonAlphakey: boolean): boolean {
    // key + char input
    if (binding.key && binding.input) {
        return (
            inputState.keyRegister[binding.key] &&
            inputState.charRegister === binding.input
        );
    }

    // key only
    if (binding.key && !binding.input) {
        if (inputState.charRegister.length) return false;

        return inputState.keyRegister[binding.key];
    }

    // char input only
    if (!binding.key && binding.input) {
        if (hasNonAlphakey) return false;

        return inputState.charRegister === binding.input;
    }

    return false;
}

function handleKeypress(): void {
    inputState.command = null;
    inputState.lastCharKey = null;

    let chunk: Buffer;
    let stdin: string = "";

    while ((chunk = process.stdin.read()) !== null) {
        stdin += chunk.toString("utf-8");
    }

    /* Handle sigint before all else */
    if (stdin === HEX_MAP.sigint) {
        EMITTER.removeAllListeners();
        process.stdin.pause();
        process.exit();
    }

    const match = (code: string) => stdin === code;
    const map: NonAlphaKeys = {
        backspace: match(HEX_MAP.backspace),
        delete: match(HEX_MAP.delete),
        esc: match(HEX_MAP.esc),
        insert: match(HEX_MAP.insert),
        return: match(HEX_MAP.return),
        tab: match(HEX_MAP.tab),
        up: match(HEX_MAP.up),
        down: match(HEX_MAP.down),
        right: match(HEX_MAP.right),
        left: match(HEX_MAP.left),
        f1: match(HEX_MAP.f1),
        f2: match(HEX_MAP.f2),
        f3: match(HEX_MAP.f3),
        f4: match(HEX_MAP.f4),
        f5: match(HEX_MAP.f5),
        f6: match(HEX_MAP.f6),
        f7: match(HEX_MAP.f7),
        f8: match(HEX_MAP.f8),
        f9: match(HEX_MAP.f9),
        f10: match(HEX_MAP.f10),
        f11: match(HEX_MAP.f11),
        f12: match(HEX_MAP.f12),

        /* ctrl will not be triggered on its own.  It can only read ctrl + letter */
        ctrl: false,
    };

    replaceKeyRegister(map);

    // console.log(inputState.keyRegister);

    /* esc key be default clears charRegister.  Otherwise the only other time the
     * charRegister is cleared is when a command is set, or the charRegister would
     * otherwise exceed a size of 2 */
    if (map.esc) {
        inputState.charRegister = "";
        EMITTER.emit(EVT.keypress);
        return;
    }

    /* Ctrl + lowercase letter.  Unfortunately, I don't believe there is any way
     * within Nodejs to recognize other combinations of special keys. */
    if (stdin.charCodeAt(0) >= 1 && stdin.charCodeAt(0) <= 26) {
        const letter = String.fromCharCode(stdin.charCodeAt(0) + 96);
        inputState.charRegister = letter;

        map.ctrl = true;
        replaceKeyRegister(map);
    } else {
        stdin && pushCharRegister(stdin);
    }

    EMITTER.emit(EVT.keypress);
}

/* public */
function listen(): void {
    if (inputState.listening) {
        return;
    }

    process.stdin.on(EVT.readable, handleKeypress);
    EMITTER.on(EVT.appStatus, handleAppStatus);

    inputState.listening = true;
}

function pause(): void {
    process.stdin.removeListener(EVT.readable, handleKeypress);
    EMITTER.removeListener(EVT.appStatus, handleAppStatus);

    inputState.listening = false;
}

/* When the app exits whether intentionally or by an error, all components unmount
 * and the useKeybinds hook makes sure all listeners are cleaned up on unmount.
 * Without removing all listeners, the node process won't end by itself */
function handleAppStatus(): void {
    const keypressListeners = EMITTER.listeners(EVT.keypress).length;

    if (!keypressListeners) {
        pause();
    }
}

const KeypressRegister = {
    listen,
    subscribe,
    processConfig,
    getCommand,
    getCharRegister,
};

export default KeypressRegister;

// /* TODO
//  * public
//  * This might be helpful for temporarily pausing all STD_IN events, but still
//  * keep the stream going. */
// function setShouldProcess(b: boolean): void {
//     inputState.shouldProcess = b;
// }
//
// /* TODO
//  * useKeybinds(config, { overrideOthers: true })
//  * Processes ONLY this config, or any others that have the same settings.  This
//  * would be helpful for switching between modes such as when you need to process
//  * text input in a form, you would want to make sure you didn't have any conflicting
//  * keybinds */
// function overrideConfig(config: KbConfig, override: boolean) {
//     inputState.override = override;
//     processConfig(config);
//
//     return () => {
//         inputState.override = !inputState.override;
//     };
// }
