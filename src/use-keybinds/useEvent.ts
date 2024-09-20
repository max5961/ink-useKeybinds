import { useEffect, useRef } from "react";
import { KeyBinds } from "./useKeybinds.js";
import Register from "./Register.js";
import { usePageFocus } from "../Components/Sequence/SequenceUnit/PageContext.js";
import { useItemFocus } from "../Components/Sequence/SequenceUnit/ItemContext.js";

export function useEvent<T extends KeyBinds = any>(
    cmd: KeyOf<T>,
    handler: (stdin: string) => unknown,
): void {
    const oldListeners = useRef<Listener[]>([]);
    Register.removeOldListeners(oldListeners.current);

    const isPageFocus = usePageFocus();
    const isItemFocus = useItemFocus();

    if (isPageFocus && isItemFocus) {
        Register.addEventListener({
            cmd,
            handler,
            oldListeners: oldListeners.current,
        });
    }

    useEffect(() => {
        return () => {
            Register.removeOldListeners(oldListeners.current);
        };
    }, []);
}

export function useTypedEvent<T extends KeyBinds>(): { useEvent: UseEvent<T> } {
    return { useEvent: useEvent as UseEvent<any> };
}

export function useMultipleEventsWithoutCtxChecks(listeners: Listener[]): void {
    const oldListeners = useRef<Listener[]>([]);
    Register.removeOldListeners(oldListeners.current);

    for (const listener of listeners) {
        Register.addEventListener({
            ...listener,
            oldListeners: oldListeners.current,
        });
    }

    useEffect(() => {
        return () => {
            Register.removeOldListeners(oldListeners.current);
        };
    }, []);
}

export interface UseEvent<T = any> {
    (cmd: keyof T, handler: (stdin: string) => unknown): void;
}

export type Listener = {
    cmd: string;
    handler: (...args: any[]) => unknown;
};

export type MultipleListeners<T extends KeyBinds = any> = {
    cmd: KeyOf<T>;
    handler: (...args: any[]) => unknown;
}[];

export type KeyOf<T extends object> = T extends object
    ? ToString<keyof T>
    : never;

type ToString<T> = T extends number ? `${T}` : T extends string ? T : never;
