import React, { useState, ReactNode, useRef, useEffect } from "react";
import { Box, measureElement } from "ink";
import ScrollBar from "./Scrollbar.js";
import { KeyBinds, OnEvent } from "../../use-keybinds/useKeybinds.js";
import { ViewState } from "./useList.js";
import { Search } from "../Search/Search.js";
import { ListItem } from "./ListItem.js";
import { isRenderable } from "./isRenderable.js";

interface ItemGen<T extends KeyBinds = any> {
    (isFocus: boolean, onItem: OnEvent<T>): React.ReactNode;
}

type Props<T extends KeyBinds = any> = {
    viewState: ViewState;
    items: (ItemGen<T> | React.ReactNode)[];
    scrollBar?: boolean;
    scrollColor?: string;
    scrollBarPosition?: "pre" | "post";
    wordList?: string[];
    vertical?: boolean;
    maintainState?: boolean;
};

export function List<T extends KeyBinds = any>({
    items,
    viewState,
    wordList,
    scrollBar = true,
    scrollColor = "white",
    scrollBarPosition = "post",
    vertical = true,
    maintainState = true,
}: Props<T>): ReactNode {
    const [hw, setHw] = useState<{ height: number; width: number }>({
        height: 0,
        width: 0,
    });

    const generatedItems = items
        // Create the nodes
        .map((item: ItemGen | React.ReactNode, idx: number) => {
            const onItem: OnEvent<T> = (...args: Parameters<OnEvent>) => {
                if (idx !== viewState._idx) return;

                /* Make sure that on every re-render we are using the most recent
                 * handler which prevents stale closure as well as unneccessary
                 * listeners */
                viewState._emitter.removeAllListeners(args[0]);
                viewState._emitter.on(args[0], args[1]);
            };

            const node = isRenderable(item)
                ? item
                : (item as ItemGen<T>)(idx === viewState._idx, onItem);

            const key = (node as React.ReactElement).key;
            const isHidden = idx < viewState._start || idx >= viewState._end;

            return (
                <ListItem
                    key={key}
                    isHidden={isHidden}
                    maintainState={maintainState}
                    /* context */
                    onItem={onItem}
                    isFocus={idx === viewState._idx}
                    index={idx}
                    items={viewState._items}
                    emitter={viewState._emitter}
                    /* context */
                >
                    {node as React.ReactNode}
                </ListItem>
            );
        });

    /* Although this goes against the current design, it might be
     * helpful if the window size was effected by these refs, or if there
     * were any overflowed elements to decrease window size until there
     * weren't any */
    const ref = useRef();
    useEffect(() => {
        if (scrollBar) {
            const { width, height } = measureElement(ref.current as any);
            setHw({ height, width });
        }
    }, [items, viewState]);

    const scrollBarPre = scrollBarPosition === "pre" && (
        <ScrollBar
            viewState={viewState}
            height={hw.height}
            width={hw.width}
            color={scrollColor}
        />
    );

    const scrollBarPost = scrollBarPosition === "post" && (
        <ScrollBar
            viewState={viewState}
            height={hw.height}
            width={hw.width}
            color={scrollColor}
        />
    );

    const search = wordList && viewState._winSize > 0 && (
        <Search
            wordList={wordList}
            idx={viewState._idx}
            goToIdx={viewState._util.goToIndex}
        />
    );

    const verticalList = vertical && (
        <Box flexDirection="column" width="100%">
            <Box
                flexDirection="row"
                justifyContent="space-between"
                width="100%"
            >
                {scrollBarPre}
                <Box display="flex" flexGrow={1} flexDirection="column">
                    <Box flexDirection="column" ref={ref as any}>
                        {generatedItems}
                    </Box>
                </Box>
                {scrollBarPost}
            </Box>
            {search}
        </Box>
    );

    const horizontalList = !vertical && (
        <Box flexDirection="row" height="100%">
            <Box
                flexDirection="column"
                justifyContent="space-between"
                height="100%"
            >
                {scrollBarPre}
                <Box display="flex" flexDirection="row">
                    <Box flexShrink={1} flexDirection="row" ref={ref as any}>
                        {generatedItems}
                    </Box>
                    <Box flexGrow={1}></Box>
                </Box>
                {scrollBarPost}
            </Box>
            {search}
        </Box>
    );

    return horizontalList || verticalList;
}
