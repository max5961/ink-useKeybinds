import React, { createContext, PropsWithChildren, useContext } from "react";
import useKeybinds, { OnCmd, UseKbOpts } from "../keybinds/useKeybinds.js";
import { KbConfig } from "../keybinds/useKeybinds.js";
import assert from "assert";

type KeybindsContext<T extends KbConfig = any> = Props;

const KeybindsContext = createContext<KeybindsContext | null>(null);

type Props = {
    config: KbConfig;
    opts?: UseKbOpts;
};

export default function Keybinds({
    config,
    opts,
    children,
}: Props & PropsWithChildren): React.ReactNode {
    return (
        <KeybindsContext.Provider value={{ config, opts }}>
            {children}
        </KeybindsContext.Provider>
    );
}

export function useOnCmd<T extends KbConfig>(): OnCmd<T> {
    const context = useContext(KeybindsContext);
    assert(
        context,
        "Cannot use this outside the context of a Keybinds component",
    );

    const { config, opts } = context;

    const { onCmd } = useKeybinds(config as T, opts);

    return onCmd;
}
