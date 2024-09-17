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

/*
 * If there is no PageContext, true is returned implying that no pages means focus
 * is always true.  If there is PageContext, return the context value for isFocus.
 * */
export function usePageFocus(): boolean {
    try {
        const pageContext = usePage();
        return pageContext.isFocus;
    } catch {
        return true;
    }
}
