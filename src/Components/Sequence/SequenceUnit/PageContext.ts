import { KeyBinds, OnPage } from "../../../use-keybinds/useKeybinds.js";
import EventEmitter from "events";
import { createContext, useContext } from "react";

export type PageContext<KeyBindsType extends KeyBinds = any> = {
    onPage: OnPage<KeyBindsType>;
    isFocus: boolean;
    emitter: EventEmitter;
    index: number;
};

export const PageContext = createContext<PageContext | null>(null);

export function usePage<
    KeyBindsType extends KeyBinds = any,
>(): PageContext<KeyBindsType> {
    const context = useContext(PageContext);

    if (!context) {
        throw new Error(
            "Attempting to use usePage hook outside the context of a Pages component",
        );
    }

    return context;
}
