import EventEmitter from "events";
import { useState } from "react";
import { KeyBinds, useKeybinds } from "../../use-keybinds/useKeybinds.js";
import { ListKeybinds } from "./util/ListKeybinds.js";
import { HandleScroll } from "./util/HandleScroll.js";
import { usePageFocus } from "./SequenceUnit/PageContext.js";

export namespace UseSequenceTypes {
    export type Opts = {
        windowSize?: number | null;
        keybinds?: KeyBinds;
        navigation?: "none" | "vi" | "arrow";
        scrollBar?: boolean;
        centerScroll?: boolean;
        emitter?: EventEmitter;
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
        _emitter: EventEmitter;
        _util: Util;
        _items: any[];
    }>;

    export type Util = {
        currentIndex: number;
        nextItem: () => void;
        prevItem: () => void;
        goToIndex: (n: number) => void;
        modifyWinSize: (n: number) => void;
        emitter: EventEmitter;
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
        scrollBar: false,
        centerScroll: false,
        navigation: "vi",
        emitter: new EventEmitter(),
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

    const emitter = opts.emitter || new EventEmitter();

    const getVim = () => {
        if (opts.navigation !== "vi") return {};
        return opts.vertical
            ? ListKeybinds.vimVertical
            : ListKeybinds.vimHorizontal;
    };

    const getArrow = () => {
        if (opts.navigation !== "arrow") return {};
        return opts.vertical
            ? ListKeybinds.arrowVertical
            : ListKeybinds.arrowHorizontal;
    };

    const customKeybinds = opts.keybinds || {};
    const vim = getVim();
    const arrow = getArrow();
    const config = { ...customKeybinds, ...vim, ...arrow };

    const { onEvent } = useKeybinds<
        | typeof ListKeybinds.vimVertical
        | typeof ListKeybinds.vimHorizontal
        | typeof ListKeybinds.arrowVertical
        | typeof ListKeybinds.arrowHorizontal
        | typeof customKeybinds
    >(config as any);

    const isPageFocus = usePageFocus();

    // prettier-ignore
    const willHandle = { increment: null, decrement: null, goToTop: null, goToBottom: null, scroll_up: null, scroll_down: null};
    for (const key in config) {
        if (key in willHandle) {
            continue;
        }

        onEvent(key, (stdin: string) => {
            if (!isPageFocus) return;

            emitter.emit(key, stdin);
        });
    }

    if (opts?.navigation !== "none" && isPageFocus) {
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
            emitter.emit("scroll_down");
            scrollDown();
        });

        onEvent("scroll_up", () => {
            emitter.emit("scroll_up");
            scrollUp();
        });
    }

    const util = {
        currentIndex: state.idx,
        nextItem,
        prevItem,
        goToIndex,
        modifyWinSize,
        emitter,
    };

    /* This must be passed into the List component */
    const viewState: UseSequenceTypes.ViewState = Object.freeze({
        _start: state.start,
        _end: state.end,
        _idx: state.idx,
        _winSize: WINDOW_SIZE,
        _itemsLen: LENGTH,
        _emitter: emitter,
        _util: util,
        _items: items,
    });

    return {
        viewState,
        util,
    };
}
