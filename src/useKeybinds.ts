import { useInput } from "ink";
import { useRef, useState } from "react";
import { KeyBinds } from "./Keybinds.js";
import { Key } from "ink";
import { EventEmitter } from "events";

/**
 * An extension of ink's builtin useInput hook.  It allows for 1-2 character
 * combinations that can be joined with non-alphanumeric keys.  It uses a config
 * object where the properties are the command names and the values are the input
 * conditions that dispatch the command.
 *
 * const kbs = {
 *     foo: { input: "f" },
 *     bar: [{ input: "bb" }, { input: "aa" }],
 *     FOO: { input: "F" },
 *     BAR: [{ input: "BA" }, { input: "Ba" }],
 *     ctrl_foobar: { input: "fb", key: "ctrl" },
 * } satisfies KbConfig;
 *
 * const { command, register } = useKeybinds(
 *     kbs,
 *     (cmd) => {
 *         if (cmd === "foo") { // do something }
 *         if (cmd === "bar") { // do something }
 *         if (cmd === "FOO") { // do something }
 *         if (cmd === "BAR") { // do something }
 *         if (cmd === "ctrl_foobar") { // do something }
 *     },
 *     { trackState: true },
 **/

export default function useKeybinds<T extends KbConfig = any>(
    kbConfig: T,
    handler: (cmd: Command<typeof kbConfig> | null) => void,
    opts?: UseKbOpts,
) {
    const [data, setData] = useState<InputData<T>>({
        register: "",
        command: "",
    });

    /* Set default opts but override if provided */
    opts = { trackState: false, ...opts };

    const kb = useRef<KeyBinds<T> | null>(
        kbConfig ? new KeyBinds(kbConfig) : null,
    );

    let command: Command<T> | null = null;
    useInput((input, key) => {
        kb.current?.handleStdIn(input, key);

        command = kb.current?.getCommand() || null;

        opts.trackState &&
            setData({
                command: command ?? "",
                register: kb.current?.getRegister() || "",
            });

        handler(command);
    });

    const emitter = new EventEmitter();
    if (command) {
        emitter.emit(command);
    }

    return { data, emitter };
}

export type KbHandler<T extends KbConfig = any> = (
    cmd: Command<T> | null,
) => void;

export type KbConfig = {
    [key: string]: Binding[] | Binding;
};

export type Binding = { key?: keyof Key; input?: string };

export type UseKbOpts = {
    trackState?: boolean;
};

export type InputData<T extends KbConfig> = {
    register: string;
    command: Command<T> | "";
};

export type Command<T extends Readonly<KbConfig>> = keyof T;
