import React, { createContext, useContext } from "react";
import { Box } from "ink";
import { KeyBinds, OnItem } from "../../use-keybinds/useKeybinds.js";
import EventEmitter from "events";
import assert from "assert";

type LIProps<T extends KeyBinds = any> = React.PropsWithChildren & {
    isFocus: boolean;
    onItem: OnItem<T>;
    emitter: EventEmitter;
    isHidden: boolean;
    maintainState: boolean;
    index: number;
    items: any;
};

type ListItemContext<
    KeyBindsType extends KeyBinds = any,
    ItemsType extends any[] = any,
> = {
    onItem: OnItem<KeyBindsType>;
    items: ItemsType;
    isFocus: boolean;
    emitter: EventEmitter;
    index: number;
};

const ListItemContext = createContext<ListItemContext | null>(null);

export function ListItem<T extends KeyBinds = any, U extends any[] = any>({
    children,
    onItem,
    items,
    isFocus,
    emitter,
    index,
    isHidden,
    maintainState,
}: LIProps): React.ReactNode {
    return (
        <ListItemContext.Provider
            value={{
                isFocus,
                onItem,
                emitter,
                index,
                items,
            }}
        >
            {isHidden && maintainState ? (
                <Box height={0} width={0} overflow="hidden">
                    {children}
                </Box>
            ) : !isHidden ? (
                <Box>{children}</Box>
            ) : null}
        </ListItemContext.Provider>
    );
}

const errMsg = (hook: string) => {
    return `It appears you are attempting to use the ${hook} hook outside the context of a List component (http://github.com/max5961/ink-list)`;
};
export function useItem<
    KeyBindsType extends KeyBinds = any,
    ItemsType extends any[] = any,
>(): ListItemContext<KeyBindsType, ItemsType> {
    const context = useContext(ListItemContext);
    assert(context, errMsg("useItem"));
    // return { onItem: context.onItem<T>, }
    return context;
}
export function useOnItem<T extends KeyBinds = any>(): OnItem<T> {
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
