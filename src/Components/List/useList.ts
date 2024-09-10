import assert from "assert";
import EventEmitter from "events";
import { produce } from "immer";
import { useState } from "react";
import { shallowEqualObjects } from "shallow-equal";
import { KeyBinds, useKeybinds } from "../../use-keybinds/useKeybinds.js";

export type Opts = {
    windowSize?: number | null;
    keybinds?: KeyBinds;
    navigation?: { auto?: boolean; vi?: boolean };
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

const defaultKeybinds = {
    increment: [{ key: "down" }, { key: "tab" }],
    decrement: [{ key: "up" }],
} satisfies KeyBinds;

const defaultVi = {
    increment: [{ input: "j" }, { key: "down" }, { key: "tab" }],
    decrement: [{ input: "k" }, { key: "up" }],
    scroll_up: { key: "ctrl", input: "u" },
    scroll_down: { key: "ctrl", input: "d" },
    goToTop: { input: "gg" },
    goToBottom: { input: "G" },
} satisfies KeyBinds;

export default function useList(
    itemsLength: number,
    opts: Opts = {},
): { viewState: ViewState; util: ListUtil } {
    /* Set defaults for opts not provided */
    opts = {
        windowSize: null,
        scrollBar: false,
        centerScroll: false,
        emitter: new EventEmitter(),
        ...opts,
    };
    opts.navigation = opts.navigation || { auto: true, vi: true };

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

    /* Entry point to modify window slice that always runs.  Any state change will
     * execute this function and adjust the window accordingly */
    handleScroll();

    function handleScroll(nextIdx: number = state.idx): void {
        const nextState = opts.centerScroll
            ? getCenterScrollChanges(nextIdx)
            : getNormalScrollChanges(nextIdx);

        if (!shallowEqualObjects(state, nextState)) {
            setState(nextState);
        }
    }

    function nextItem(): void {
        if (state.idx >= LENGTH - 1) return;

        handleScroll(state.idx + 1);
    }

    function prevItem(): void {
        if (state.idx <= 0) return;

        handleScroll(state.idx - 1);
    }

    function goToIndex(nextIdx: number): void {
        if (nextIdx > LENGTH - 1 || nextIdx < 0) return;
        // handleScroll(nextIdx);
        const nextState = getCenterScrollChanges(nextIdx);
        if (!shallowEqualObjects(state, nextState)) {
            setState(nextState);
        }
    }

    /* TODO: This doesn't account for 0 window size */
    function modifyWinSize(nextSize: number): void {
        if (LENGTH === 0) return;

        const nextState = produce(state, (draft) => {
            nextSize = Math.abs(nextSize);
            nextSize = Math.min(nextSize, LENGTH);

            let target = nextSize - WINDOW_SIZE;
            while (target) {
                /* nextSize is greater than current size.  It is also impossible
                 * to slice the idx out of frame when increasing the window */
                if (target > 0) {
                    if (draft.end < LENGTH) {
                        ++draft.end;
                    } else if (draft.start > 0) {
                        --draft.start;
                    } else {
                        // For dev
                        assert(
                            false,
                            "Impossible case in modifyWinSize (inc win size)",
                        );
                    }

                    --target;
                } else {
                    /* Since we are decreasing the window size it is possible to
                     * cut the idx out of frame. Cut from bottom as long as possible
                     * without cutting idx out of frame, then cut from top. */
                    if (draft.idx < draft.end - 1) {
                        --draft.end;
                    } else if (draft.idx === draft.end - 1) {
                        // console.log("ayo am i even getting le triggered");
                        ++draft.start;
                    } else {
                        // For dev
                        assert(
                            false,
                            "Impossible case in modifyWinSize (dec win size)",
                        );
                    }

                    ++target;
                }
            }

            // For dev
            const msg = "idx out of range on window resize";
            assert(draft.idx < draft.end && draft.idx >= draft.start, msg);

            /* Just in case idx somehow gets out of frame after the resize */
            draft.idx = Math.min(draft.idx, draft.end - 1);
            draft.idx = Math.max(draft.idx, draft.start);

            // This is the problem in case nextSize isn't equal to trueWindowSize
            draft._winSize = nextSize;

            if (opts.centerScroll) {
                centerIdx(draft);
            }
        });

        /* TODO: Split center scroll functions so that we can center after a window
         * size adjustment */
        if (!shallowEqualObjects(state, nextState)) {
            setState(nextState);
        }
    }

    function getTrueWindowSize(start, end): number {
        return Math.min(LENGTH, end) - start;
    }

    function getNormalScrollChanges(nextIdx: number): HookState {
        return produce(state, (draft) => {
            if (LENGTH === 0) return;
            if (
                (draft.start === 0 && draft.end === 0) ||
                draft.start === draft.end
            ) {
                return;
            }

            draft.end = Math.min(draft.end, LENGTH);
            draft.start = Math.max(draft.start, 0);
            const getTrueWindowSize = () => {
                return Math.min(LENGTH, draft.end) - draft.start;
            };

            let trueWindowSize = getTrueWindowSize();
            while (trueWindowSize < WINDOW_SIZE && trueWindowSize < LENGTH) {
                --draft.start;
                --draft.end;
                trueWindowSize = getTrueWindowSize();
            }

            draft.idx = Math.min(nextIdx, LENGTH - 1);
            draft.idx = Math.max(0, draft.idx);

            // next idx out of range (goToIndex)
            while (draft.idx >= draft.end && draft.end < LENGTH) {
                ++draft.end;
                ++draft.start;
            }
            while (draft.idx < draft.start && draft.start >= 0) {
                --draft.end;
                --draft.start;
            }

            // next idx 'bumps' into next viewing window
            if (draft.idx === draft.end && draft.end < LENGTH) {
                ++draft.start;
                ++draft.end;
                return;
            }
            if (draft.idx === draft.start - 1 && draft.start > 0) {
                --draft.start;
                --draft.end;
                return;
            }
        });
    }

    function getCenterScrollChanges(nextIdx: number): HookState {
        const noIdxChange = nextIdx === state.idx;

        return produce(state, (draft) => {
            draft.end = Math.min(draft.end, LENGTH);
            draft.start = Math.max(draft.start, 0);
            if (LENGTH === 0) return;
            if (draft.start === 0 && draft.end === 0) return;

            const getTrueWindowSize = () => {
                return Math.min(LENGTH, draft.end) - draft.start;
            };

            let trueWindowSize = getTrueWindowSize();
            while (trueWindowSize < WINDOW_SIZE && trueWindowSize < LENGTH) {
                --draft.start;
                --draft.end;
                trueWindowSize = getTrueWindowSize();
            }

            draft.idx = Math.min(nextIdx, LENGTH - 1);
            draft.idx = Math.max(0, draft.idx);
            const getMid = (s, e) => Math.floor((s + e) / 2);

            if (noIdxChange) return;

            // next idx out of range (goToIndex)
            while (draft.idx >= draft.end && draft.end < LENGTH) {
                ++draft.end;
                ++draft.start;
            }
            while (draft.idx < draft.start && draft.start >= 0) {
                --draft.end;
                --draft.start;
            }
            // center idx in viewing window if possible
            centerIdx(draft);

            // next idx 'bumps' into next viewing window
            const mid = getMid(draft.start, draft.end);
            if (draft.idx > mid && draft.end !== LENGTH) {
                ++draft.start;
                ++draft.end;
                return;
            }
            if (draft.idx < mid && draft.start > 0) {
                --draft.start;
                --draft.end;
                return;
            }
        });
    }

    function centerIdx(draft: HookState) {
        const getMid = (s, e) => Math.floor((s + e) / 2);
        // prettier-ignore
        while (draft.idx > getMid(draft.start, draft.end) && draft.end < LENGTH) {
            ++draft.start;
            ++draft.end;
        }
        while (draft.idx < getMid(draft.start, draft.end) && draft.start > 0) {
            --draft.start;
            --draft.end;
        }
    }

    const emitter = opts.emitter || new EventEmitter();

    const customKeybinds = opts.keybinds || {};
    let config: KeyBinds = defaultKeybinds;
    if (opts.navigation.auto && opts.navigation.vi) {
        config = defaultVi;
    }

    config = { ...config, ...customKeybinds };

    const { onEvent } = useKeybinds<
        typeof defaultVi | typeof defaultKeybinds | typeof customKeybinds
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
        console.log("ayo?");
        const half = Math.floor(WINDOW_SIZE / 2);
        const nextIdx = Math.min(LENGTH, state.idx + half);
        goToIndex(nextIdx);
    });

    onEvent("scroll_up", () => {
        console.log("ayo up?");
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
