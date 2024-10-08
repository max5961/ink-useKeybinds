import EventEmitter from "events";
import { Binding, KeyBinds } from "./useKeybinds.js";
import { KEYCODES, newKeyRegister, NonAlphaKeys } from "./Keycodes.js";
import { Listener } from "./useEvent.js";

/*
 * This module is the single source of truth for all keypress data.  On every
 * keypress, the Register is updated which notifies each useKeybinds hook to
 * process their configurations to check for keybind matches.  Because the
 * Register holds up to 2 alphanumeric keys, if each hook had its own separate
 * Register state you would end up with inconsistent behavior
 *
 * The only non-alphanumeric keys that can be combined are ctrl + any alphanumeric
 * key. Otherwise non-alphanumeric keys can only be mapped with themselves.
 * */

type State = {
    chars: string;
    keys: NonAlphaKeys;
    ctrlKeys: string;
    listening: boolean;
    event: string | null;
    eventSet: boolean;
    eventEmitted: boolean;
    registerSize: number;
};

const state: State = {
    chars: "",
    keys: newKeyRegister(),
    ctrlKeys: "",
    listening: false,
    event: null,
    eventSet: false,
    eventEmitted: false,
    registerSize: 2,
};

export const EVT = {
    keypress: "KEYPRESS",
    appStatus: "APP_STATUS",
    data: "data",
    mounted: "MOUNTED",
} as const;

/*
 * Handles EVT events that are relevant to this module and notifies functions
 * that have subscribed to keypress events within the useKeybinds hook
 * */
const REGISTER_EMITTER = new EventEmitter();
REGISTER_EMITTER.setMaxListeners(30);

/*
 * Emits events within the App that useEvent hooks can respond to.
 * */
export const APP_EMITTER = new EventEmitter();
APP_EMITTER.setMaxListeners(100);

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
    REGISTER_EMITTER.addListener(event, listener);

    process.stdin.setEncoding("utf-8");
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    } else {
        ++notTTYcount === 1 &&
            console.warn(
                "Raw mode not supported.  Keypresses will not behave as expected",
            );
    }

    return () => {
        REGISTER_EMITTER.removeListener(event, listener);

        /* This wont effect normal state updates since by the time this executes
         * there will be a new subscriber in place of the old one.  However, it
         * could cause the app to exit if you replaced the entire component that
         * contained the hook with a loading screen while waiting on a task to
         * complete.  Thats not to say that this module isn't compatible with
         * loading screens, just that having no EVT.keypress subscribers will remove
         * all listeners set by this module which will cause the application to
         * exit
         * */
        setImmediate(() => REGISTER_EMITTER.emit(EVT.appStatus));
        // REGISTER_EMITTER.emit(EVT.appStatus);
    };
}

/*
 * PUBLIC
 */
function hasMounted(): void {
    REGISTER_EMITTER.emit(EVT.mounted);
}

/*
 * PUBLIC
 * */
function checkSuccessfulMount(): void {
    let isMounted = false;

    REGISTER_EMITTER.once(EVT.mounted, () => {
        isMounted = true;
    });

    check();

    function check(i: number = 0) {
        if (++i === 5) return;

        setImmediate(() => {
            if (!isMounted) {
                return pause();
            } else {
                check(i);
            }
        });
    }
}

/*
 * PUBLIC
 * Removes old event listeners added from a hook.
 * */
function removeOldListeners(oldListeners: Listener[]): void {
    for (const listener of oldListeners) {
        const { cmd, handler } = listener;
        APP_EMITTER.removeListener(cmd, handler);
    }
}

/*
 * PUBLIC
 * Only emits an event if one has not already been emitted during this processing
 * cycle
 * */
function emit(event: string | null, stdin: string): void {
    if (state.eventEmitted || event === null) return;

    APP_EMITTER.emit(event, stdin);
    state.eventEmitted = true;
}

/*
 * PUBLIC
 * Adds an event listener to the APP_EMITTER object.  If onEvent is passed as a
 * prop this won't unsubscribe the previous render if the child re-renders without
 * the parent that provided onEvent, leading to extra handler executions for the
 * child
 * */
function addEventListener({
    cmd,
    handler,
    oldListeners,
}: {
    cmd: string;
    handler: (...args: any[]) => unknown;
    oldListeners: Listener[];
}): void {
    oldListeners.push({ cmd, handler });
    APP_EMITTER.on(cmd, handler);
}

/*
 * PUBLIC
 * */
function getEvent(): string | null {
    return state.event;
}

/*
 * PUBLIC
 */
function getCharRegister(): string {
    return state.chars;
}

/*
 * PUBLIC
 * */
function setRegisterSize(n: number): void {
    state.registerSize = Math.max(1, n);
}

/*
 * PRIVATE
 * */
function setEvent(event: string | number): void {
    state.event = typeof event === "string" ? event : String(event);
    state.chars = "";

    // Block config processing until the next EVT.keypress event.
    // Next EVT.keypress event will also reset all of the stdin registers
    state.eventSet = true;
}

/*
 * PRIVATE
 * */
function pushCharRegister(s: string): void {
    if (s === "") return;

    if (state.chars.length >= state.registerSize) {
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
 * Allows useKeybinds hooks to process their configurations.  If no match is found
 * no event will be set.  However, if another configuration had previously set
 * set a event in response to EVT.keypress then that event will not be reset.
 * Every EVT.keypress event clears the event, but once a event is set it is
 * immutable until the next EVT.keypress event
 * */
function processConfig(config: KeyBinds): void {
    if (state.eventSet) return;

    /* Is there a non alphanumeric keypress?  We need to know so that bindings
     * such as just "f" should not trigger ctrl + f for example. */
    const hasNonAlphaKey = Object.values(state.keys).some((b) => b);

    for (const event in config) {
        const binding = config[event];

        let match = false;
        if (Array.isArray(binding)) {
            match = binding.some((b) => checkMatch(b, hasNonAlphaKey));
        } else {
            match = checkMatch(binding, hasNonAlphaKey);
        }

        if (match) setEvent(event);
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
    state.eventSet = false;
    state.eventEmitted = false;
    state.event = null;
    state.ctrlKeys = "";

    /* Handle sigint before all else */
    if (stdin === KEYCODES.sigint) {
        REGISTER_EMITTER.removeAllListeners();
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
        backspace: match(KEYCODES.backspace),
        delete: match(KEYCODES.delete),
        esc: match(KEYCODES.esc),
        insert: match(KEYCODES.insert),
        return: match(KEYCODES.return),
        tab: match(KEYCODES.tab),
        up: match(KEYCODES.up),
        down: match(KEYCODES.down),
        right: match(KEYCODES.right),
        left: match(KEYCODES.left),
        f1: match(KEYCODES.f1),
        f2: match(KEYCODES.f2),
        f3: match(KEYCODES.f3),
        f4: match(KEYCODES.f4),
        f5: match(KEYCODES.f5),
        f6: match(KEYCODES.f6),
        f7: match(KEYCODES.f7),
        f8: match(KEYCODES.f8),
        f9: match(KEYCODES.f9),
        f10: match(KEYCODES.f10),
        f11: match(KEYCODES.f11),
        f12: match(KEYCODES.f12),

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

    REGISTER_EMITTER.emit(EVT.keypress, stdin);
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
    REGISTER_EMITTER.on(EVT.appStatus, handleAppStatus);

    state.listening = true;
}

/* PRIVATE
 * Removes all extra listeners so that the app can exit
 * */
function pause(): void {
    APP_EMITTER.removeAllListeners();
    REGISTER_EMITTER.removeAllListeners(EVT.mounted);

    process.stdin.removeListener(EVT.data, handleKeypress);
    REGISTER_EMITTER.removeListener(EVT.appStatus, handleAppStatus);

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
    const keypressListeners = REGISTER_EMITTER.listenerCount(EVT.keypress);

    if (!keypressListeners) {
        pause();
    }
}

const Register = {
    listen,
    removeOldListeners,
    pause,
    subscribe,
    processConfig,
    getEvent,
    getCharRegister,
    addEventListener,
    emit,
    hasMounted,
    checkSuccessfulMount,
    setRegisterSize,

    // For testing
    handleKeypress,
};

export default Register;
