import { useEffect, useRef, useState } from "react";
import Register from "./Register.js";
import { EventEmitter } from "events";
import { EVT } from "./Register.js";
import { Key } from "./HexMap.js";
import { randomUUID } from "crypto";
import ProcessingGate from "./ProcessingGate.js";
import { useStdin } from "ink";

process.stdin.setRawMode(true);
process.stdin.setEncoding("utf-8");

export default function useKeybinds<T extends KbConfig = any>(
    kbConfig: T,
    opts?: UseKbOpts,
): KbData<T> & { onCmd: OnCmd<T> } {
    Register.listen();

    const [ID] = useState(randomUUID());

    /* Set default opts but override if provided */
    opts = { trackState: false, priority: 1, ...opts };

    const [data, setData] = useState<KbData<T>>({
        register: "",
        command: "",
        lastKeypress: "",
    });

    const commandEmitter = useRef<EventEmitter>(new EventEmitter());

    /* This makes sure were don't end up with excess listeners every time the
     * hook runs */
    const unsubscribe = useRef<() => void>(() => {});
    unsubscribe.current();

    const priority = opts.priority === undefined ? 1 : opts.priority;

    useEffect(() => {
        ProcessingGate.update(ID, priority);
    }, [opts.priority]);

    if (ProcessingGate.canProcess(ID, priority)) {
        // console.log(`CAN PROCESS: ${ID}`);
        unsubscribe.current = Register.subscribe(EVT.keypress, handleStdin);
    }

    useEffect(() => {
        ProcessingGate.update(ID, priority);
        // console.log(`${ID} ${ProcessingGate.canProcess(ID, priority)}`);
        // console.log(ProcessingGate.debug());
        // console.log("");

        return () => {
            unsubscribe.current();
            commandEmitter.current.removeAllListeners();
            ProcessingGate.remove(ID);
        };
    }, []);

    function handleStdin() {
        Register.processConfig(kbConfig, ID, priority);

        const register = Register.getCharRegister();
        const command = Register.getCommand();

        if (opts?.trackState) {
            setData({
                register,
                command: command || "",
                lastKeypress: Register.getLastChar(),
            });
        }

        if (command) {
            commandEmitter.current.emit(command);
        }

        commandEmitter.current.emit(EVT.keypress, Register.getLastChar());
    }

    commandEmitter.current.removeAllListeners();

    function onCmd<T extends KbConfig>(
        cmd: WONums<T> | typeof EVT.keypress,
        handler: (char: string) => void,
    ): any {
        if (ProcessingGate.canProcess(ID, priority)) {
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

export type Binding = { key?: Key; input?: string };

export type UseKbOpts = {
    /* Default false. returns { register: string; command: string }
     * 'register' stores the last 1-2 alphanumeric key presses and is wiped out
     * when a command is matched
     * 'command' is the last command to have been matched */
    trackState?: boolean;

    /*
     * Only the hook(s) with the highest priority will process their configs and
     * emit commands.  Defaults to 1, so setting priority to 0 is one way of
     * muting a set of keybinds
     * */
    priority?: number;
};

export type KbData<T extends KbConfig> = {
    register: string;
    command: Command<T> | "";
    lastKeypress: string;
};

export interface OnCmd<T extends KbConfig> {
    (
        cmd: WONums<T> | typeof EVT.keypress,
        handler: (char: string) => any,
    ): void;
}

export type Command<T extends Readonly<KbConfig>> = keyof T;

/* union type of the keys of an object but excludes possible number types that
 * aren't compatible with types that expect strings */
export type WONums<T extends object> = T extends object
    ? keyof T extends string | symbol
        ? keyof T
        : never
    : never;
