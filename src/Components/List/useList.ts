import assert from "assert";
import EventEmitter from "events";
import { produce } from "immer";
import { useState } from "react";
import { shallowEqualObjects } from "shallow-equal";
import { KeyBinds, useKeybinds } from "../../use-keybinds/useKeybinds.js";
import ListKeybinds from "./ListKeybinds.js";
import HandleScroll from "./HandleScroll.js";

export type Opts = {
    windowSize?: number | null;
    keybinds?: KeyBinds;
    navigation?: "none" | "vi" | "arrows";
    scrollBar?: boolean;
    centerScroll?: boolean;
    cmdHandler?: any;
    emitter?: EventEmitter;
};

export type HookState = {
    idx: number;
    start: number;
    end: number;
    _winSize: number;
};

export type ViewState = Readonly<{
    /* Used within the List component */
    _start: number;
    _end: number;
    _idx: number;
    _winSize: number;
    _itemsLen: number;
    _emitter: EventEmitter;
    _util: ListUtil;
}>;

export type ListUtil = {
    currentIndex: number;
    nextItem: () => void;
    prevItem: () => void;
    goToIndex: (n: number) => void;
    modifyWinSize: (n: number) => void;
    emitter: EventEmitter;
};

export default function useList(
    itemsLength: number,
    opts: Opts = {},
): { viewState: ViewState; util: ListUtil } {
    /* Set defaults for opts not provided */
    opts = {
        windowSize: null,
        scrollBar: false,
        centerScroll: false,
        navigation: "vi",
        emitter: new EventEmitter(),
        ...opts,
    };

    const [state, setState] = useState<HookState>({
        /* The index within the entire list of React Nodes */
        idx: 0,

        /* The index of the first element within the viewing window */
        start: 0,

        /* The index AFTER the last element within the viewing window */
        end: Math.min(opts.windowSize || itemsLength, itemsLength),

        /* This can only be modified through the modifyWinSize function in
         * order to keep the scrolling functions simple */
        _winSize: opts.windowSize || itemsLength,
    });

    const LENGTH = itemsLength;
    const WINDOW_SIZE = Math.min(state._winSize || LENGTH, LENGTH);

    const init = {
        state,
        setState,
        LENGTH,
        WINDOW_SIZE,
        centerScroll: opts.centerScroll || false,
    };

    const handleScroll = new HandleScroll(init);
    const { handle, nextItem, prevItem, modifyWinSize, goToIndex } =
        handleScroll.getFunctions();

    handle();

    const emitter = opts.emitter || new EventEmitter();

    const customKeybinds = opts.keybinds || {};
    const vim = opts.navigation === "vi" ? ListKeybinds.vim : {};
    const arrow = opts.navigation === "arrows" ? ListKeybinds.arrow : {};
    const config = { ...customKeybinds, ...vim, ...arrow };

    const { onEvent } = useKeybinds<
        | typeof ListKeybinds.vim
        | typeof ListKeybinds.arrow
        | typeof customKeybinds
    >(config as any);

    // prettier-ignore
    const willHandle = { increment: null, decrement: null, goToTop: null, goToBottom: null, scroll_up: null, scroll_down: null};
    for (const key in config) {
        if (key in willHandle) {
            continue;
        }

        onEvent(key, (stdin: string) => {
            emitter.emit(key, stdin);
        });
    }

    onEvent("increment", () => {
        emitter.emit("increment");
        nextItem();
    });

    onEvent("decrement", () => {
        emitter.emit("decrement");
        prevItem();
    });

    onEvent("goToTop", () => {
        emitter.emit("goToTop");
        goToIndex(0);
    });

    onEvent("goToBottom", () => {
        emitter.emit("goToBottom");
        goToIndex(LENGTH - 1);
    });

    onEvent("scroll_down", () => {
        const half = Math.floor(WINDOW_SIZE / 2);
        const nextIdx = Math.min(LENGTH - 1, state.idx + half);
        goToIndex(nextIdx);
    });

    onEvent("scroll_up", () => {
        const half = Math.floor(WINDOW_SIZE / 2);
        const nextIdx = Math.max(0, state.idx - half);
        goToIndex(nextIdx);
    });

    const util = {
        currentIndex: state.idx,
        nextItem,
        prevItem,
        goToIndex,
        modifyWinSize,
        emitter,
    };

    /* This must be passed into the List component */
    const viewState: ViewState = Object.freeze({
        _start: state.start,
        _end: state.end,
        _idx: state.idx,
        _winSize: WINDOW_SIZE,
        _itemsLen: LENGTH,
        _emitter: emitter,
        _util: util,
    });

    return {
        viewState,
        util,
    };
}
