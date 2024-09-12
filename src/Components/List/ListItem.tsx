import React, { createContext, useContext } from "react";
import { Box } from "ink";
import { KeyBinds } from "../../use-keybinds/useKeybinds.js";
import { OnEvent } from "../../use-keybinds/useKeybinds.js";
import EventEmitter from "events";
import assert from "assert";

type LIProps<T extends KeyBinds = any> = React.PropsWithChildren & {
    isFocus: boolean;
    onItem: OnEvent<T>;
    emitter: EventEmitter;
    isHidden?: boolean;
};

type LIContext<T extends KeyBinds = any> = {
    onItem: OnEvent<T>;
    isFocus: boolean;
    emitter: EventEmitter;
};

const ListItemContext = createContext<LIContext | null>(null);

export function ListItem<T extends KeyBinds = any>({
    children,
    onItem,
    emitter,
    isFocus,
    isHidden = false,
}: LIProps<T>): React.ReactNode {
    return (
        <ListItemContext.Provider
            value={{
                isFocus,
                onItem,
                emitter,
            }}
        >
            {isHidden ? (
                <Box height={0} width={0} overflow="hidden">
                    {children}
                </Box>
            ) : (
                <Box>{children}</Box>
            )}
        </ListItemContext.Provider>
    );
}

const errMsg = (hook: string) => {
    return `It appears you are attempting to use the ${hook} hook outside the context of a List component (http://github.com/max5961/ink-list)`;
};
export function useListItemContext(): LIContext {
    const context = useContext(ListItemContext);
    assert(context, errMsg("useListItemContext"));
    return context;
}
export function useOnItem<T extends KeyBinds = any>(): OnEvent<T> {
    const context = useContext(ListItemContext);
    assert(context, errMsg("useOnItem"));
    return context.onItem;
}
export function useIsFocus(): boolean {
    const context = useContext(ListItemContext);
    assert(context, errMsg("useIsFocus"));
    return context.isFocus;
}
export function useListItemEmitter(): EventEmitter {
    const context = useContext(ListItemContext);
    assert(context, errMsg("useListItemEmitter"));
    return context.emitter;
}
