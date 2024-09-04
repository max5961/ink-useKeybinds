import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useRef,
} from "react";
import { useKeybinds, OnCmd, OnCmdGenerator, KbConfig } from "./useKeybinds.js";
import assert from "assert";

type KeybindsContext<T extends KbConfig = any> = {
    onCmdGenerator: OnCmdGenerator<T>;
};

const KeybindsContext = createContext<KeybindsContext | null>(null);

type Props = {
    config: KbConfig;
    opts?: Exclude<
        Parameters<typeof useKeybinds>[number],
        undefined | KbConfig
    >;
};

export default function Keybinds({
    config,
    opts,
    children,
}: Props & PropsWithChildren): React.ReactNode {
    const { onCmdGenerator } = useKeybinds(config, opts);

    return (
        <KeybindsContext.Provider value={{ onCmdGenerator }}>
            {children}
        </KeybindsContext.Provider>
    );
}

export function useOnCmd<T extends KbConfig = any>(): OnCmd<T> {
    const context = useContext(KeybindsContext);
    assert(
        context,
        "Cannot use this outside the context of a Keybinds component",
    );

    const { onCmdGenerator } = context;

    /* Since we are getting the onCmd function through context, we don't have
     * the luxury of every state update executing the useKeybinds hook and clearing
     * the event listeners, so we need to handle that within this hook.  Otherwise
     * each rerender accumulates old event listeners */
    const unsubscribers = useRef<(() => void)[]>([]);
    unsubscribers.current.forEach((unsubscriber) => {
        unsubscriber();
    });

    const onCmd = onCmdGenerator(unsubscribers.current);

    return onCmd;
}
