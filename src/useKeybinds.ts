import { useContext, useEffect, useRef, useState } from "react";
import Register, { EVT } from "./Register.js";
import { Key } from "./HexMap.js";
import { EventEmitter } from "events";
import { randomUUID } from "crypto";
import KeybindProcessingGate, {
    Priority,
    useKeybindPriority,
} from "./KeybindProcessingGate.js";
import Keybinds, { useOnCmd } from "./Keybinds.js";

type Opts = {
    /*
     * Defaults to false. returns { register: string; command: string }
     * 'register' stores the last 1-2 alphanumeric key presses and is wiped out
     * when a command is matched
     * 'command' is the last command to have been matched
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

type Return<T extends KbConfig> = KbData<T> & {
    onCmd: OnCmd<T>;
    onCmdGenerator: OnCmdGenerator<T>;
};

export function useKeybinds<T extends KbConfig = any>(
    kbConfig: T,
    opts?: Opts,
): Return<T> {
    opts = { trackState: false, priority: "default", ...opts };

    const ProcessingGate = useKeybindPriority();

    const PRIORITY = opts.priority || "default";
    const [ID] = useState(randomUUID());
    const [HOOK_EMITTER] = useState(new EventEmitter());

    const [data, setData] = useState<KbData<T>>({
        register: "",
        command: "",
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
            setData({ command: "", register: "" });
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
        const command = Register.getCommand();

        if (opts?.trackState) {
            setData({
                register,
                command: command || "",
            });
        }

        if (command) {
            HOOK_EMITTER.emit(command, stdin);
        }
    }

    HOOK_EMITTER.removeAllListeners();

    function onCmd<T extends KbConfig>(
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
    function onCmdGenerator<T extends KbConfig>(
        unsubscriberList: any,
    ): OnCmd<T> {
        return function onCmd(
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
        onCmd,
        onCmdGenerator,
        ...data,
    };
}

export type KbConfig = {
    [key: string]: Binding[] | Binding;
};

export type Command<T extends Readonly<KbConfig>> = keyof T;

export type Binding = {
    key?: Key;
    notKey?: Key[];
    input?: string;
    notInput?: string[];
};

export type KbData<T extends KbConfig> = {
    register: string;
    command: Command<T> | "";
};

export interface OnCmd<T extends KbConfig> {
    (cmd: WONums<T>, handler: (stdin: string) => unknown): void;
}

export interface OnCmdGenerator<T extends KbConfig> {
    (unsubscriberList: (() => void)[]): OnCmd<T>;
}

/* union type of the keys of an object but excludes possible number types that
 * aren't compatible with types that expect strings */
export type WONums<T extends object> = T extends object
    ? keyof T extends string | symbol
        ? keyof T
        : never
    : never;

export default {
    useKeybinds,
    Keybinds,
    KeybindProcessingGate,
    useOnCmd,
};
