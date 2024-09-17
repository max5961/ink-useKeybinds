import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useRef,
} from "react";
import {
    useKeybinds,
    OnEvent,
    OnEventGenerator,
    KeyBinds,
} from "./useKeybinds.js";
import assert from "assert";
import { usePageFocus } from "../Components/Sequence/SequenceUnit/PageContext.js";

type KeybindsProviderContext<T extends KeyBinds = any> = {
    onEventGenerator: OnEventGenerator<T>;
};

const KeybindsProviderContext = createContext<KeybindsProviderContext | null>(
    null,
);

type Props = {
    config: KeyBinds;
    opts?: Exclude<
        Parameters<typeof useKeybinds>[number],
        undefined | KeyBinds
    >;
};

export function KeybindsProvider({
    config,
    opts,
    children,
}: Props & PropsWithChildren): React.ReactNode {
    const { onEventGenerator } = useKeybinds(config, opts);

    return (
        <KeybindsProviderContext.Provider value={{ onEventGenerator }}>
            {children}
        </KeybindsProviderContext.Provider>
    );
}

export function useOnApp<T extends KeyBinds = any>(): { onApp: OnEvent<T> } {
    const context = useContext(KeybindsProviderContext);
    assert(
        context,
        "Cannot use this outside the context of a KeybindsProvider component",
    );

    const { onEventGenerator } = context;

    /* Since we are getting the onEvent function through context, we don't have
     * the luxury of every state update executing the useKeybinds hook and clearing
     * the event listeners, so we need to handle that within this hook.  Otherwise
     * each rerender accumulates old event listeners */
    const unsubscribers = useRef<(() => void)[]>([]);
    unsubscribers.current.forEach((unsubscriber) => {
        unsubscriber();
    });

    const isPageFocus = usePageFocus();
    const onApp = onEventGenerator(unsubscribers.current, isPageFocus);

    return { onApp };
}
