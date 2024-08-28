import { useEffect, useRef, useState } from "react";
import Register from "./KeypressRegister.js";
import { EventEmitter } from "events";
import { EVT } from "./KeypressRegister.js";
import { Key } from "./HexMap.js";

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf-8");

export default function useKeybinds<T extends KbConfig = any>(
    kbConfig: T,
    opts?: UseKbOpts,
): KbData<T> & { onCmd: OnCmd<T> } {
    Register.listen();

    /* Set default opts but override if provided */
    opts = { trackState: false, pause: false, override: false, ...opts };

    const [data, setData] = useState<KbData<T>>({
        register: "",
        command: "",
    });

    const commandEmitter = useRef<EventEmitter>(new EventEmitter());

    /* This makes sure were don't end up with excess listeners every time the
     * hook runs */
    const unsubscribe = useRef<() => void>(() => {});
    unsubscribe.current();
    unsubscribe.current = Register.subscribe(EVT.keypress, handleStdin);

    useEffect(() => {
        return () => {
            unsubscribe.current();
            commandEmitter.current.removeAllListeners();
        };
    }, []);

    function handleStdin() {
        Register.processConfig(kbConfig);

        const register = Register.getCharRegister();
        const command = Register.getCommand();

        if (opts?.trackState) {
            setData({
                ...data,
                register,
                command: command || "",
            });
        }

        if (command) {
            commandEmitter.current.emit(command);
        }
    }

    commandEmitter.current.removeAllListeners();

    function onCmd<T extends KbConfig>(
        cmd: WONums<T>,
        handler: () => void,
    ): any {
        commandEmitter.current.on(cmd, handler);
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

    /* Default false. Toggle this hooks ability to respond to std input */
    pause?: boolean;

    /* Pauses processing of other keybinds that don't have the override option set */
    override?: boolean;
};

export type KbData<T extends KbConfig> = {
    register: string;
    command: Command<T> | "";
};

export interface OnCmd<T extends KbConfig> {
    (cmd: WONums<T>, handler: () => any): void;
}

export type Command<T extends Readonly<KbConfig>> = keyof T;

/* union type of the keys of an object but excludes possible number types that
 * aren't compatible with types that expect strings */
export type WONums<T extends object> = T extends object
    ? keyof T extends string | symbol
        ? keyof T
        : never
    : never;
