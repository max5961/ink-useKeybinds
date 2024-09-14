import { useEffect, useRef, useState } from "react";
import Register, { EVT } from "./Register.js";
import { Key } from "./Keycodes.js";
import { EventEmitter } from "events";
import { randomUUID } from "crypto";
import { Priority, useKeybindPriority } from "./KeybindProcessingGate.js";

type Opts = {
    /*
     * Defaults to false. returns { register: string; event: string }
     * 'register' stores the last 1-2 alphanumeric key presses and is wiped out
     * when a event is matched
     * 'event' is the last event to have been matched
     * */
    trackState?: boolean;

    /*
     * Defaults to "default"
     * "never" | "default" | "override" | "always" | "textinput"
     * Determines if the configuration will be processed on keypress events
     * based on priorities of other instances of this hook elsewhere in the app.
     * default and override don't effect always, but textinput overrides all
     * priorities including always
     * */
    priority?: Priority;
};

type Return<T extends KeyBinds> = StdinData<T> & {
    onEvent: OnEvent<T>;
    onEventGenerator: OnEventGenerator<T>;
};

export function useKeybinds<T extends KeyBinds = any>(
    kbConfig: T,
    opts?: Opts,
): Return<T> {
    opts = { trackState: false, priority: "default", ...opts };

    const ProcessingGate = useKeybindPriority();

    const PRIORITY = opts.priority || "default";
    const [ID] = useState(randomUUID());
    const [HOOK_EMITTER] = useState(new EventEmitter());

    const [data, setData] = useState<StdinData<T>>({
        register: "",
        event: "",
    });

    /*
     * If not already listening to the stdin stream, start listening
     * */
    if (PRIORITY !== "never") {
        Register.listen();
    }

    const canProcess = ProcessingGate.canProcess(ID, PRIORITY);

    /*
     * Unsubscribe and resubscribe to keypress events so that we don't end up
     * with extra untracked listeners
     * */
    const unsubscribe = useRef<() => void>(() => {});
    unsubscribe.current();
    if (canProcess) {
        unsubscribe.current = Register.subscribe(EVT.keypress, handleStdin);
    }

    useEffect(() => {
        if (canProcess) {
            return;
        }

        if (opts.trackState) {
            setData({ event: "", register: "" });
        }
    }, [canProcess]);

    useEffect(() => {
        ProcessingGate.updatePriority(ID, PRIORITY);
    }, [opts.priority]);

    useEffect(() => {
        ProcessingGate.updatePriority(ID, PRIORITY);

        return () => {
            unsubscribe.current();
            HOOK_EMITTER.removeAllListeners();
            ProcessingGate.removeHook(ID);
        };
    }, []);

    function handleStdin(stdin: string) {
        Register.processConfig(kbConfig);

        const register = Register.getCharRegister();
        const event = Register.getCommand();

        if (opts?.trackState) {
            setData({
                register,
                event: event || "",
            });
        }

        if (event) {
            HOOK_EMITTER.emit(event, stdin);
        }
    }

    HOOK_EMITTER.removeAllListeners();

    function onEvent<T extends KeyBinds>(
        cmd: WONums<T>,
        handler: (stdin: string) => void,
    ): any {
        if (canProcess) {
            HOOK_EMITTER.on(cmd, handler);
        }
    }

    /* For use within the Keybinds context component so that each component
     * that uses the context is separate from one another and allows to
     * unsubscribe and resubscribe on every re-render so that there aren't
     * multiple responders to an event */
    function onEventGenerator<T extends KeyBinds>(
        unsubscriberList: any,
    ): OnEvent<T> {
        return function onEvent(
            cmd: WONums<T>,
            handler: (stdin: string) => unknown,
        ): void {
            if (canProcess) {
                HOOK_EMITTER.on(cmd, handler);
            }
            unsubscriberList.push(() => {
                HOOK_EMITTER.removeListener(cmd, handler);
            });
        };
    }

    return {
        onEvent,
        onEventGenerator,
        ...data,
    };
}

export type KeyBinds = {
    [key: string]: Binding[] | Binding;
};

export type KeyBindEvent<T extends Readonly<KeyBinds>> = keyof T;

export type Binding = {
    key?: Key;
    notKey?: Key[];
    input?: string;
    notInput?: string[];
};

export type StdinData<T extends KeyBinds = any> = {
    register: string;
    event: KeyBindEvent<T> | "";
};

export interface OnEvent<T extends KeyBinds = any> {
    (cmd: WONums<T>, handler: (stdin: string) => unknown): void;
}

export interface OnEventGenerator<T extends KeyBinds = any> {
    (unsubscriberList: (() => void)[]): OnEvent<T>;
}

export type OnItem<T extends KeyBinds = any> = OnEvent<T>;
export type OnPage<T extends KeyBinds = any> = OnEvent<T>;

/* union type of the keys of an object but excludes possible number types that
 * aren't compatible with types that expect strings */
export type WONums<T extends object> = T extends object
    ? keyof T extends string | symbol
        ? keyof T
        : string
    : string;
