import { useState } from "react";
import { KeyBinds, useKeybinds } from "../../use-keybinds/useKeybinds.js";
import { LIST_CMDS, ListKeybinds } from "./util/ListKeybinds.js";
import { HandleScroll } from "./util/HandleScroll.js";
import { useEvent } from "../../use-keybinds/useEvent.js";

export namespace UseSequenceTypes {
    export type Opts = {
        windowSize?: number | null;
        navigation?:
            | "none"
            | "vi-vertical"
            | "vi-horizontal"
            | "arrow-vertical"
            | "arrow-horizontal";
        centerScroll?: boolean;
        circular?: boolean;
        vertical?: boolean;
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
        _util: Util;
        _items: any[];
    }>;

    export type Util = {
        currentIndex: number;
        nextItem: () => void;
        prevItem: () => void;
        goToIndex: (n: number) => void;
        modifyWinSize: (n: number) => void;
    };

    export type Return = {
        viewState: ViewState;
        util: Util;
    };
}

export function useSequence(
    items: unknown[],
    opts: UseSequenceTypes.Opts = {},
): UseSequenceTypes.Return {
    /* Set defaults for opts not provided */
    opts = {
        windowSize: null,
        centerScroll: false,
        navigation: "vi-vertical",
        circular: false,
        vertical: true,
        ...opts,
    };

    const [state, setState] = useState<UseSequenceTypes.HookState>({
        /* The index within the entire list of React Nodes */
        idx: 0,

        /* The index of the first element within the viewing window */
        start: 0,

        /* The index AFTER the last element within the viewing window */
        end: Math.min(opts.windowSize || items.length, items.length),

        /* This can only be modified through the modifyWinSize function in
         * order to keep the scrolling functions simple */
        _winSize: opts.windowSize || items.length,
    });

    const LENGTH = items.length;
    const WINDOW_SIZE = Math.min(state._winSize ?? LENGTH, LENGTH);

    const init = {
        state,
        setState,
        LENGTH,
        WINDOW_SIZE,
        opts,
    };

    const handleScroll = new HandleScroll(init);
    const {
        handle,
        nextItem,
        prevItem,
        modifyWinSize,
        goToIndex,
        scrollDown,
        scrollUp,
    } = handleScroll.getFunctions();

    handle();

    // prettier-ignore
    const getNavigationKeybinds = () => {
        switch (opts.navigation) {
            case "vi-vertical": return ListKeybinds.vimVertical;
            case "vi-horizontal": return ListKeybinds.vimHorizontal;
            case "arrow-vertical": return ListKeybinds.arrowVertical;
            case "arrow-horizontal": return ListKeybinds.arrowHorizontal;
            default: return {};
        }
    }

    const navigationKeybinds = getNavigationKeybinds();
    useKeybinds(navigationKeybinds);

    useEvent(LIST_CMDS.increment, () => {
        nextItem();
    });
    useEvent(LIST_CMDS.decrement, () => {
        prevItem();
    });
    useEvent(LIST_CMDS.goToTop, () => {
        goToIndex(0);
    });
    useEvent(LIST_CMDS.goToBottom, () => {
        goToIndex(LENGTH - 1);
    });
    useEvent(LIST_CMDS.scrollDown, () => {
        scrollDown();
    });
    useEvent(LIST_CMDS.scrollUp, () => {
        scrollUp();
    });

    const util = {
        currentIndex: state.idx,
        nextItem,
        prevItem,
        goToIndex,
        modifyWinSize,
    };

    /* This must be passed into the List component */
    const viewState: UseSequenceTypes.ViewState = Object.freeze({
        _start: state.start,
        _end: state.end,
        _idx: state.idx,
        _winSize: WINDOW_SIZE,
        _itemsLen: LENGTH,
        _util: util,
        _items: items,
    });

    return {
        viewState,
        util,
    };
}
