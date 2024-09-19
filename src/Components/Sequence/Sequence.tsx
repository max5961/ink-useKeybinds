import React, { useState, ReactNode, useRef, useEffect } from "react";
import { Box, measureElement } from "ink";
import ScrollBar from "./Scrollbar.js";
import { KeyBinds } from "../../use-keybinds/useKeybinds.js";
import { UseSequenceTypes } from "./useSequence.js";
// import { Search } from "../Search/Search.js";
import { isRenderable } from "./util/isRenderable.js";
import { SequenceUnit } from "./SequenceUnit/SequenceUnit.js";
import { usePageFocus } from "./SequenceUnit/PageContext.js";
import { KeyOf, Listener } from "../../use-keybinds/useEvent.js";

export namespace SequenceTypes {
    export interface OnEvent<T extends KeyBinds = any> {
        (cmd: KeyOf<T>, handler: (...args: any[]) => unknown): void;
    }

    export interface UnitGen<T extends KeyBinds = any> {
        (isFocus: boolean, onUnit: OnEvent<T>): React.ReactNode;
    }

    export type Type = "ITEMS" | "PAGES";

    export type Props<T extends KeyBinds = any> = {
        type: Type;
        viewState: UseSequenceTypes.ViewState;
        items: (UnitGen<T> | React.ReactNode)[];
        scrollBar?: boolean;
        scrollColor?: string;
        scrollBarPosition?: "pre" | "post";
        wordList?: string[];
        direction?: "vertical" | "horizontal";
        maintainState?: boolean;
    };
}

/* ----- UNTIL USEEVENT IS SETTLED ----- */
function Search({
    wordList,
    idx,
    goToIdx,
}: {
    wordList: string[];
    idx: number;
    goToIdx: (n: number) => void;
}): React.ReactNode {
    return null;
}

export function Sequence<T extends KeyBinds = any>({
    items,
    viewState,
    wordList,
    type,
    scrollBar = true,
    scrollColor = "white",
    scrollBarPosition = "post",
    direction = "vertical",
    maintainState = true,
}: SequenceTypes.Props): ReactNode {
    const [hw, setHw] = useState<{ height: number; width: number }>({
        height: 0,
        width: 0,
    });

    const isPageFocus = usePageFocus();
    const generatedItems = items.map(
        (item: SequenceTypes.UnitGen | React.ReactNode, idx: number) => {
            const listeners: Listener[] = [];

            const isFocus = idx === viewState._idx;
            const onUnit = (
                cmd: string,
                handler: (...args: any[]) => unknown,
            ) => {
                if (!isFocus || !isPageFocus) return;
                listeners.push({ cmd, handler });
            };

            const node = isRenderable(item)
                ? item
                : (item as SequenceTypes.UnitGen<T>)(isFocus, onUnit);

            const key = (node as React.ReactElement).key;
            const isHidden = idx < viewState._start || idx >= viewState._end;

            return (
                <SequenceUnit
                    key={key}
                    type={type}
                    listeners={listeners}
                    isHidden={isHidden}
                    maintainState={maintainState ?? false}
                    /* context */
                    isFocus={idx === viewState._idx}
                    index={idx}
                    items={viewState._items}
                    /* context */
                >
                    {node as React.ReactNode}
                </SequenceUnit>
            );
        },
    );

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

    const verticalList = direction === "vertical" && (
        <Box flexDirection="column" height="100%" width="100%">
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

    const horizontalList = direction === "horizontal" && (
        <Box flexDirection="row" height="100%" width="100%">
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
