import React, { useState, ReactNode, useRef, useEffect } from "react";
import { Box, measureElement } from "ink";
import ScrollBar from "./Scrollbar.js";
import { KeyBinds, OnEvent } from "../../use-keybinds/useKeybinds.js";
import { UseSequenceTypes } from "./useSequence.js";
import { Search } from "../Search/Search.js";
import { isRenderable } from "./util/isRenderable.js";
import { SequenceUnit } from "./SequenceUnit/SequenceUnit.js";
import { usePage } from "./SequenceUnit/PageContext.js";

export namespace SequenceTypes {
    export interface ItemGen<T extends KeyBinds = any> {
        (isFocus: boolean, onItem: OnEvent<T>): React.ReactNode;
    }

    export interface PageGen<T extends KeyBinds = any> {
        (isFocus: boolean, onPage: OnEvent<T>): React.ReactNode;
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
        vertical?: boolean;
        maintainState?: boolean;
    };
}

export function Sequence<T extends KeyBinds = any>({
    items,
    viewState,
    wordList,
    type,
    scrollBar = true,
    scrollColor = "white",
    scrollBarPosition = "post",
    vertical = true,
    maintainState = true,
}): ReactNode {
    const [hw, setHw] = useState<{ height: number; width: number }>({
        height: 0,
        width: 0,
    });

    let isPageFocus = true;
    try {
        const pageCtx = usePage();
        isPageFocus = pageCtx.isFocus;
    } catch (_) {}

    const generatedItems = items.map(
        (item: SequenceTypes.ItemGen | React.ReactNode, idx: number) => {
            const isFocus = idx === viewState._idx;

            const onUnit: OnEvent<T> = (...args: Parameters<OnEvent>) => {
                if (!isFocus || !isPageFocus) return;

                /* Make sure that on every re-render we are using the most recent
                 * handler which prevents stale closure as well as unneccessary
                 * listeners */
                viewState._emitter.removeAllListeners(args[0]);
                viewState._emitter.on(args[0], args[1]);
            };

            const node = isRenderable(item)
                ? item
                : (item as SequenceTypes.ItemGen<T>)(isFocus, onUnit);

            const key = (node as React.ReactElement).key;
            const isHidden = idx < viewState._start || idx >= viewState._end;

            return (
                <SequenceUnit
                    key={key}
                    type={type}
                    isHidden={isHidden}
                    maintainState={maintainState ?? false}
                    /* context */
                    isFocus={idx === viewState._idx}
                    onUnit={onUnit}
                    index={idx}
                    items={viewState._items}
                    emitter={viewState._emitter}
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

function useGenerateUnits<T extends KeyBinds = any>(
    props: SequenceTypes.Props,
) {
    return props.items.map(
        (item: SequenceTypes.ItemGen | React.ReactNode, idx: number) => {
            /* See if the Page that contains List is in focus.  If there are no
             * pages, then this will default to true */
            let pageFocus = true;
            try {
                const pageCtx = usePage();
                pageFocus = pageCtx.isFocus;
            } catch (_) {}
            const isFocus = idx === props.viewState._idx && pageFocus;

            const onUnit: OnEvent<T> = (...args: Parameters<OnEvent>) => {
                if (!isFocus) return;

                /* Make sure that on every re-render we are using the most recent
                 * handler which prevents stale closure as well as unneccessary
                 * listeners */
                props.viewState._emitter.removeAllListeners(args[0]);
                props.viewState._emitter.on(args[0], args[1]);
            };

            const node = isRenderable(item)
                ? item
                : (item as SequenceTypes.ItemGen<T>)(isFocus, onUnit);

            const key = (node as React.ReactElement).key;
            const isHidden =
                idx < props.viewState._start || idx >= props.viewState._end;

            return (
                <SequenceUnit
                    key={key}
                    type={props.type}
                    isHidden={isHidden}
                    maintainState={props.maintainState ?? false}
                    /* context */
                    onUnit={onUnit}
                    isFocus={idx === props.viewState._idx}
                    index={idx}
                    items={props.viewState._items}
                    emitter={props.viewState._emitter}
                    /* context */
                >
                    {node as React.ReactNode}
                </SequenceUnit>
            );
        },
    );
}
