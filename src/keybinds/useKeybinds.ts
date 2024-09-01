import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Register, { EVT } from "./Register.js";
import { Key } from "./HexMap.js";
import { EventEmitter } from "events";
import { randomUUID } from "crypto";
import { ProcessingGateContext, Priority } from "./KeybindProcessingGate.js";
import assert from "assert";

let i = 0;
export default function useKeybinds<T extends KbConfig = any>(
    kbConfig: T,
    opts?: UseKbOpts,
): KbData<T> & { onCmd: OnCmd<T> } {
    // console.log(`useKeybinds: ${++i}`);
    opts = { trackState: false, priority: "default", ...opts };

    const ProcessingGate = useContext(ProcessingGateContext);
    assert(ProcessingGate);

    const [ID] = useState(randomUUID());
    const [data, setData] = useState<KbData<T>>({
        register: "",
        command: "",
    });

    /*
     * Begin listening to stdin if not already
     * */
    if (opts.priority && opts.priority !== "never") {
        Register.listen();
    }

    const commandEmitter = useRef<EventEmitter>(new EventEmitter());

    /*
     * Unsubscribe and resubscribe to keypress events so that we don't end up
     * with extra untracked listeners
     * */
    const unsubscribe = useRef<() => void>(() => {});
    unsubscribe.current();
    if (ProcessingGate.canProcess(ID, opts.priority || "default")) {
        unsubscribe.current = Register.subscribe(EVT.keypress, handleStdin);
    }

    useEffect(() => {
        ProcessingGate.updatePriority(ID, opts.priority || "default");
    }, [opts.priority]);

    useEffect(() => {
        ProcessingGate.updatePriority(ID, opts.priority || "default");

        return () => {
            unsubscribe.current();
            commandEmitter.current.removeAllListeners();
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
            commandEmitter.current.emit(command, stdin);
        }
    }

    commandEmitter.current.removeAllListeners();

    function onCmd<T extends KbConfig>(
        cmd: WONums<T>,
        handler: (stdin: string) => void,
    ): any {
        if (ProcessingGate && ProcessingGate.canProcess(ID, opts!.priority!)) {
            commandEmitter.current.on(cmd, handler);
        }

        // commandEmitter.current.on(cmd, () => {
        //     if (ProcessingGate.canProcess(ID, priority)) {
        //         handler(data.lastKeypress);
        //     }
        // });
    }

    return { onCmd, ...data };
}

export type KbConfig = {
    [key: string]: Binding[] | Binding;
};

export type Binding = {
    key?: Key;
    notKey?: Key[];
    input?: string;
    notInput?: string[];
};

export type UseKbOpts = {
    /*
     * Defaults to false. returns { register: string; command: string }
     * 'register' stores the last 1-2 alphanumeric key presses and is wiped out
     * when a command is matched
     * 'command' is the last command to have been matched
     * */
    trackState?: boolean;

    /*
     * todo
     * */
    priority?: Priority;
};

export type KbData<T extends KbConfig> = {
    register: string;
    command: Command<T> | "";
};

export interface OnCmd<T extends KbConfig> {
    (cmd: WONums<T>, handler: (stdin: string) => unknown): void;
}

export type Command<T extends Readonly<KbConfig>> = keyof T;

/* union type of the keys of an object but excludes possible number types that
 * aren't compatible with types that expect strings */
export type WONums<T extends object> = T extends object
    ? keyof T extends string | symbol
        ? keyof T
        : never
    : never;
