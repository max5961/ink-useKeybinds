import { useEffect, useRef, useState } from "react";
import { emitKeypressEvents } from "readline";
import Register, { hookDebugEmitter, Key } from "./KeypressRegister.js";
import { shallowEqualObjects } from "shallow-equal";
import { EventEmitter } from "events";
import whyIsNodeRunning from "why-is-node-running";

emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf-8");

export default function useKeybinds<T extends KbConfig = any>(
    kbConfig: T,
    opts?: UseKbOpts,
): Data<T> & { onCmd: OnCmd<T> } {
    Register.listen();

    /* Set default opts but override if provided */
    opts = { trackState: false, pause: false, override: false, ...opts };

    const [data, setData] = useState<Data<T>>({
        register: "",
        command: "",
    });

    const emitter = useRef<EventEmitter>(new EventEmitter());
    // const emitter = useRef<EventEmitter>(hookDebugEmitter);

    // Create unsubscribe refs
    const stdinRef = useRef<() => void>(() => {});
    const charDownRef = useRef<() => void>(() => {});

    // unsubscribe
    stdinRef.current();
    charDownRef.current();

    // resubscribe
    stdinRef.current = Register.subscribe("STD_IN", handleStdin);
    charDownRef.current = Register.subscribe("CHAR_DOWN", () => {});

    useEffect(() => {
        return () => {
            stdinRef.current();
            charDownRef.current();
            emitter.current.removeAllListeners();
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
            emitter.current.emit(command);
        }
    }

    emitter.current.removeAllListeners();

    function onCmd<T extends KbConfig>(
        cmd: WONums<T>,
        handler: () => void,
    ): any {
        emitter.current.on(cmd, handler);
    }

    return { onCmd, ...data };
}

export type KbHandler<T extends KbConfig = any> = (
    cmd: Command<T> | null,
) => void;

export type KbConfig = {
    [key: string]: Binding[] | Binding;
};

export type Binding = { key?: keyof Key; input?: string };

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

type Data<T extends KbConfig> = {
    register: string;
    command: Command<T> | "";
};

interface OnCmd<T extends KbConfig> {
    (cmd: WONums<T>, handler: () => any): void;
}

export type Command<T extends Readonly<KbConfig>> = keyof T;

export type Handler<T extends KbConfig = any> = (
    cmd: Command<T> | null,
) => void;

// union type of the keys of an object but excludes possible number types that
// aren't compatible with types that expect strings
export type WONums<T extends object> = T extends object
    ? keyof T extends string | symbol
        ? keyof T
        : never
    : never;
