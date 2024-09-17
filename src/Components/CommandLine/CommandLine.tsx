import React, {
    PropsWithChildren,
    useState,
    createContext,
    useContext,
    useCallback,
    useRef,
} from "react";
import { Text, Box } from "ink";
import { Input } from "../Input/Input.js";
import { useFormInput } from "../Input/useFormInput.js";
import { KEYCODES } from "../../use-keybinds/Keycodes.js";
import EventEmitter from "events";
import assert from "assert";
import { usePage } from "../Sequence/SequenceUnit/PageContext.js";

type UnsubscribeList = (() => void)[];

type CommandLineContext = {
    onCmdGenerator: (
        unsubscribeList: UnsubscribeList,
        isPageFocus: boolean,
    ) => (cmd: string, handler: () => unknown) => void;
    EMITTER: EventEmitter;
    commands: Commands;
};

const CommandLineContext = createContext<CommandLineContext | null>(null);

type Props = {
    commands: Commands;
};

export type Commands = { [commandName: string]: (() => unknown) | null };

export function CommandLine({
    commands,
    children,
}: Props & PropsWithChildren): React.ReactNode {
    const [EMITTER] = useState(new EventEmitter());

    const onCmdGenerator = useCallback(
        (unsubscribeList: UnsubscribeList, isPageFocus: boolean) =>
            (cmd: string, handler: () => unknown) => {
                const handlerWrapper = () => {
                    if (!isPageFocus) return;
                    handler();
                };

                EMITTER.on(cmd, handlerWrapper);
                unsubscribeList.push(() => {
                    EMITTER.removeListener(cmd, handlerWrapper);
                });
            },
        [],
    );

    return (
        <CommandLineContext.Provider
            value={{
                onCmdGenerator,
                EMITTER,
                commands,
            }}
        >
            {children}
        </CommandLineContext.Provider>
    );
}

CommandLine.Prompt = function Prompt(): React.ReactNode {
    const context = useContext(CommandLineContext);
    assert(
        context,
        "Trying to use CommandLineContext outside of Command component",
    );

    const { EMITTER, commands } = context;

    const text = useFormInput({
        enter: { input: ":" },
        exit: [{ key: "esc" }, { key: "return" }],
    });

    function onSubmit(stdin: string) {
        if (stdin === KEYCODES.esc) {
            return text.clearText();
        }

        const cmd = commands[text.str];

        if (text.str in commands) {
            typeof cmd === "function" && cmd();
            EMITTER.emit(text.str);
        } else {
            text.setText(`command not found: ${text.str}`);
        }
    }

    function onEnter() {
        text.clearText();
    }

    return (
        <Box display="flex" width="100">
            <Text>{text.insert || text.str.length ? ":" : ""}</Text>
            <Input text={text} onSubmit={onSubmit} onEnter={onEnter} />
        </Box>
    );
};

export function useOnCmd() {
    const context = useContext(CommandLineContext);
    assert(
        context,
        "Trying to use CommandLineContext outside of Command component",
    );

    let isPageFocus = true;
    try {
        const pageCtx = usePage();
        isPageFocus = pageCtx.isFocus;
    } catch (_) {}

    const unsubscribeList = useRef<UnsubscribeList>([]);

    unsubscribeList.current.forEach((unsub) => {
        unsub();
    });

    const onCmd = context.onCmdGenerator(unsubscribeList.current, isPageFocus);

    return onCmd;
}
