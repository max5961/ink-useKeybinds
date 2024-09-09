import React, { useState, ReactNode, useRef, useEffect } from "react";
import { Box, measureElement, Text } from "ink";
import EventEmitter from "events";
import ScrollBar from "./Scrollbar.js";
import { KeyBinds, OnEvent } from "../../use-keybinds/useKeybinds.js";
import { useContext, createContext } from "react";
import assert from "assert";
import { ViewState } from "./useList.js";
import { Search } from "../Search/Search.js";

interface ItemGen<T extends KeyBinds = any> {
    (isFocus: boolean, onItem: OnEvent<T>): React.ReactNode;
}

type ListProps<T extends KeyBinds = any> = {
    itemGenerators: ItemGen<T>[];
    viewState: ViewState;
    scrollBar?: boolean;
    scrollColor?: string;
    wordList?: string[];
};

export function List<T extends KeyBinds = any>({
    itemGenerators,
    viewState,
    wordList,
    scrollBar = true,
    scrollColor = "white",
}: ListProps<T>): ReactNode {
    const [hw, setHw] = useState<{ height: number; width: number }>({
        height: 0,
        width: 0,
    });

    const ref = useRef();

    const generatedItems: ReactNode[] = itemGenerators
        // Create the nodes
        .map((item: ItemGen, idx: number) => {
            const onItem: OnEvent<T> = (...args: Parameters<OnEvent>) => {
                if (idx !== viewState._idx) return;

                /* Make sure that on every re-render we are using the most recent
                 * handler which prevents stale closure as well as unneccessary
                 * listeners */
                viewState._emitter.removeAllListeners(args[0]);
                viewState._emitter.on(args[0], args[1]);
            };

            const node = item(idx === viewState._idx, onItem);
            const key = (node as React.ReactElement).key;
            const isHidden = idx < viewState._start || idx >= viewState._end;

            return (
                <ListItem
                    key={key}
                    onItem={onItem}
                    isFocus={idx === viewState._idx}
                    emitter={viewState._emitter}
                    isHidden={isHidden}
                >
                    {node}
                </ListItem>
            );
        });

    /* Although this goes against the current design, it might be
     * helpful if the window size was effected by these refs, or if there
     * were any overflowed elements to decrease window size until there
     * weren't any */
    useEffect(() => {
        if (scrollBar) {
            const { width, height } = measureElement(ref.current as any);
            setHw({ height, width });
        }
    }, [itemGenerators, viewState]);

    return (
        <Box flexDirection="column" width="100">
            <Box
                flexDirection="row"
                justifyContent="space-between"
                width="100%"
            >
                <Box display="flex" flexDirection="column">
                    <Box flexShrink={1} flexDirection="column" ref={ref as any}>
                        {generatedItems}
                    </Box>
                    <Box flexGrow={1}></Box>
                </Box>
                {scrollBar && (
                    <ScrollBar
                        viewState={viewState}
                        height={hw.height}
                        width={hw.width}
                        color={scrollColor}
                    />
                )}
            </Box>
            {wordList && (
                <Search
                    wordList={wordList}
                    idx={viewState._idx}
                    goToIdx={viewState._util.goToIndex}
                />
            )}
        </Box>
    );
}

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

function ListItem<T extends KeyBinds = any>({
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
