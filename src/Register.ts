import EventEmitter from "events";
import { Binding, KbConfig } from "./useKeybinds.js";
import { HEX_MAP, newKeyRegister, NonAlphaKeys } from "./HexMap.js";

/*
 * This module is the single source of truth for all keypress data.  On every
 * keypress, the Register is updated which notifies each useKeybinds hook to
 * process their configurations to check for keybind matches.  Each hook returns
 * an onCmd function that can respond to matches.
 *
 * The keypress Register stores the 2 most recent alphanumeric keys pressed and a
 * mapping of the non-alphanumeric keys pressed.  The Register resets when a
 * configuration is processed and matches the Register state.  The only
 * non-alphanumeric keys that can be combined are ctrl + any alphanumeric key.
 * Otherwise non-alphanumeric keys can only be mapped with themselves.
 *
 * Because the Register holds up to 2 alphanumeric keys, if each hook had their
 * own Register, you would end up with inconsistent behavior
 * */

type State = {
    chars: string;
    keys: NonAlphaKeys;
    ctrlKeys: string;
    command: string | null;
    listening: boolean;
};

const state: State = {
    chars: "",
    keys: newKeyRegister(),
    ctrlKeys: "",
    listening: false,
    command: null,
};

export const EVT = {
    keypress: "KEYPRESS",
    appStatus: "APP_STATUS",
    data: "data",
} as const;

const EMITTER = new EventEmitter();
EMITTER.setMaxListeners(5);

/*
 * PUBLIC
 * Allows the useKeybinds hook to subscribe functions to EVT.keypress events and
 * return a function to unsubscribe.  When the unsubscribe function runs we emit
 * the EVT.appStatus event which checks to see if we still have any functions
 * subscribed to EVT.keypress events.  If not, we can safely remove our stdin
 * listener so that the application can exit.  Listeners will be subscribed and
 * unsubscribed every time the hook runs
 * */
let notTTYcount = 0;
function subscribe(
    event: typeof EVT.keypress,
    listener: (stdin: string) => void,
): () => void {
    EMITTER.addListener(event, listener);

    process.stdin.setEncoding("utf-8");
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    } else {
        ++notTTYcount === 1 &&
            console.error(
                "Raw mode not supported.  Keypresses will not behave as expected",
            );
    }

    return () => {
        EMITTER.removeListener(event, listener);

        /* This wont effect normal state updates since by the time this executes
         * there will be a new subscriber in place of the old one.  However, it
         * could cause the app to exit if you replaced the entire component that
         * contained the hook with a loading screen while waiting on a task to
         * complete.  Thats not to say that this module isn't compatible with
         * loading screens, just that having no EVT.keypress subscribers will remove
         * all listeners set by this module which will cause the application to
         * exit
         * */
        setImmediate(() => EMITTER.emit(EVT.appStatus));
        // EMITTER.emit(EVT.appStatus);
    };
}

/*
 * PUBLIC
 * */
function getCommand(): string | null {
    return state.command;
}

/*
 * PUBLIC
 */
function getCharRegister(): string {
    return state.chars;
}

/*
 * PRIVATE
 * */
function setCommand(command: string): void {
    state.command = command;
    state.chars = "";
}

/*
 * PRIVATE
 * */
function pushCharRegister(s: string): void {
    if (s === "") return;

    if (state.chars.length >= 2) {
        state.chars = "";
    }

    state.chars += s;
}

/*
 * PRIVATE
 * */
function clearCharRegister(): void {
    state.chars = "";
}

/*
 * PRIVATE
 * */
function replaceKeyRegister(mapping: NonAlphaKeys): void {
    state.keys = mapping;
}

/*
 * PUBLIC
 * Allows useKeybinds hooks to process their configurations
 * */
function processConfig(config: KbConfig): void {
    /* Is there a non alphanumeric keypress?  We need to know so that bindings
     * such as just "f" should not trigger ctrl + f for example. */
    const hasNonAlphaKey = Object.values(state.keys).some((b) => b);

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

/*
 * PRIVATE
 * */
function checkMatch(binding: Binding, hasNonAlphakey: boolean): boolean {
    // Empty object triggers any key press
    if (!Object.keys(binding).length) {
        return true;
    }

    // notKey and notInput match anything that is not in their array of values
    if ((binding.notKey || binding.notInput) && checkNotMatch(binding)) {
        return true;
    }

    // key + char input
    if (binding.key && binding.input) {
        if (binding.key === "ctrl") {
            return state.ctrlKeys === binding.input;
        }
        // This should always evaluate to false
        return state.keys[binding.key] && state.chars === binding.input;
    }

    // key only
    if (binding.key && !binding.input) {
        return state.keys[binding.key];
    }

    // char input only
    if (!binding.key && binding.input) {
        if (hasNonAlphakey) return false;

        return state.chars === binding.input;
    }

    return false;
}

function checkNotMatch(binding: Binding): boolean {
    const notKey = binding.notKey || [];
    const notInput = binding.notInput || [];

    for (const k of notKey) {
        if (state.keys[k]) {
            return false;
        }
    }

    for (const s of notInput) {
        if (state.chars === s) {
            return false;
        }
    }

    return true;
}

/*
 * PRIVATE
 * Handler for process.stdin.on("data").  Updates the state then emits an event
 * that notifies all hooks that the state has been updated
 * */
function handleKeypress(stdin: string): void {
    state.command = null;
    state.ctrlKeys = "";

    /* Handle sigint before all else */
    if (stdin === HEX_MAP.sigint) {
        EMITTER.removeAllListeners();
        process.stdin.pause();
        process.exit();
    }

    let dirtySpecKey = false;
    const match = (code: string) => {
        if (stdin === code) {
            dirtySpecKey = true;
        }
        return stdin === code;
    };
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

    /* Special key press always clears char register */
    dirtySpecKey && clearCharRegister();

    /* Ctrl + lowercase letter.  Unfortunately, I don't believe there is any way
     * within Nodejs to recognize other combinations of special keys. */
    const charCode = stdin.charCodeAt(0);
    if (charCode >= 1 && charCode <= 26) {
        const letter = String.fromCharCode(charCode + 96);
        state.ctrlKeys = letter;
        state.chars = "";

        map.ctrl = true;
        dirtySpecKey = true;
        replaceKeyRegister(map);
    } else {
        if (!dirtySpecKey) {
            stdin && pushCharRegister(stdin);
        } else {
            clearCharRegister();
        }
    }

    EMITTER.emit(EVT.keypress, stdin);
}

/*
 * PUBLIC
 * Entry point into listening for keypress data that each useKeybinds hook
 * executes
 * */
function listen(): void {
    if (state.listening) {
        return;
    }

    process.stdin.resume();
    process.stdin.on(EVT.data, handleKeypress);
    EMITTER.on(EVT.appStatus, handleAppStatus);

    state.listening = true;
}

/* PRIVATE
 * Removes all extra listeners so that the app can exit
 * */
function pause(): void {
    process.stdin.removeListener(EVT.data, handleKeypress);
    EMITTER.removeListener(EVT.appStatus, handleAppStatus);

    /* Before pausing process.stdin ensure that we aren't interfering with any
     * other listeners outside the scope of this module */
    const count = (e: string) => process.stdin.listenerCount(e);
    const extraListeners = [count("readable"), count("data")].reduce((a, c) => {
        return a + c;
    }, 0);

    if (!extraListeners) {
        process.stdin.pause();
    }

    state.listening = false;
}

/*
 * PRIVATE
 * Check to see if the app still has any hooks subscribed to EVT.keypress
 * events.  If not, execute the pause function so the app can exit.  Listeners
 * are removed on unmount and when the app exits (by error or purposefully) all
 * components are unmounted.
 * */
function handleAppStatus(): void {
    const keypressListeners = EMITTER.listenerCount(EVT.keypress);

    if (!keypressListeners) {
        pause();
    }
}

const Register = {
    listen,
    pause,
    subscribe,
    processConfig,
    getCommand,
    getCharRegister,

    // For testing
    handleKeypress,
};

export default Register;
