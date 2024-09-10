import assert from "assert";
import { HookState } from "./useList.js";
import { produce } from "immer";
import { shallowEqualObjects } from "shallow-equal";

type Init = {
    state: HookState;
    setState(newState: HookState): void;
    LENGTH: number;
    WINDOW_SIZE: number;
    centerScroll: boolean;
};

export default class HandleScroll {
    private readonly state: HookState;
    private readonly setState: (newState: HookState) => void;
    private readonly centerScroll: boolean;
    private readonly LENGTH: number;
    private readonly WINDOW_SIZE: number;

    constructor({ state, setState, LENGTH, WINDOW_SIZE, centerScroll }: Init) {
        this.state = state;
        this.setState = setState;
        this.LENGTH = LENGTH;
        this.WINDOW_SIZE = WINDOW_SIZE;
        this.centerScroll = centerScroll;
    }

    getFunctions = () => {
        return {
            handle: this.handle,
            nextItem: this.nextItem,
            prevItem: this.prevItem,
            goToIndex: this.goToIndex,
            modifyWinSize: this.modifyWinSize,
        };
    };

    /*
     * Entry point that executes on every re-render.  Splits control to modify
     * window for center or normal scroll.  Why not execute handle on a
     * useEffect dependency instead? Not sure right now...I might have had a
     * reason for doing it this way though.
     * */
    handle = (nextIdx: number = this.state.idx): void => {
        const nextState = this.centerScroll
            ? this.getCenterScrollChanges(nextIdx)
            : this.getNormalScrollChanges(nextIdx);

        /* If no changes were made, don't update state.  */
        if (!shallowEqualObjects(this.state, nextState)) {
            this.setState(nextState);
        }
    };

    /*
     * Goes to the specified index and centers within the window
     * */
    goToIndex = (nextIdx: number): void => {
        if (nextIdx >= this.LENGTH || nextIdx < 0) return;

        const nextState = this.getCenterScrollChanges(nextIdx);

        if (!shallowEqualObjects(this.state, nextState)) {
            this.setState(nextState);
        }
    };

    nextItem = (): void => {
        if (this.state.idx >= this.LENGTH - 1) return;

        this.handle(this.state.idx + 1);
    };

    prevItem = (): void => {
        if (this.state.idx <= 0) return;

        this.handle(this.state.idx - 1);
    };

    /*
     * Gets draft state changes
     * */
    getNormalScrollChanges = (nextIdx: number = this.state.idx): HookState => {
        const LENGTH = this.LENGTH;
        const WINDOW_SIZE = this.WINDOW_SIZE;

        return produce(this.state, (draft) => {
            if (LENGTH === 0) return;
            if (draft.start === 0 && draft.end === 0) return;
            if (draft.start === draft.end) return;

            const getTrueWindowSize = () => {
                return Math.min(LENGTH, draft.end) - draft.start;
            };

            let trueWindowSize = getTrueWindowSize();
            while (trueWindowSize < WINDOW_SIZE && trueWindowSize < LENGTH) {
                --draft.start;
                --draft.end;
                trueWindowSize = getTrueWindowSize();
            }

            this.constrainWindow({ draft, LENGTH });
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
    };

    /*
     * Gets draft state changes for center scroll
     * */
    getCenterScrollChanges = (nextIdx: number = this.state.idx): HookState => {
        const LENGTH = this.LENGTH;
        const WINDOW_SIZE = this.WINDOW_SIZE;

        const noIdxChange = nextIdx === this.state.idx;

        return produce(this.state, (draft) => {
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

                if (draft.start < 0) {
                    throw new Error("Stuck in an endless loop");
                    // break;
                }
            }

            this.constrainWindow({ draft, LENGTH });
            draft.idx = Math.min(nextIdx, LENGTH - 1);
            draft.idx = Math.max(0, draft.idx);
            const getMid = (s: number, e: number) => Math.floor((s + e) / 2);

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
            this.centerIdx({ draft, LENGTH });

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
    };

    private centerIdx = ({
        draft,
        LENGTH,
    }: {
        draft: HookState;
        LENGTH: number;
    }): void => {
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
    };

    modifyWinSize = (nextSize: number, center: boolean = false): void => {
        const LENGTH = this.LENGTH;
        const WINDOW_SIZE = this.WINDOW_SIZE;

        if (LENGTH === 0) return;

        const nextState = produce(this.state, (draft) => {
            nextSize = Math.abs(nextSize);
            nextSize = Math.min(nextSize, LENGTH);

            let target = nextSize - WINDOW_SIZE;
            while (target) {
                /* Increase window size
                 * nextSize is greater than current size. */
                if (target > 0) {
                    if (draft.end < LENGTH) {
                        ++draft.end;
                    } else if (draft.start > 0) {
                        --draft.start;
                    } else {
                        // For dev
                        throw new Error(
                            "Impossible case in modifyWinSize (inc win size)",
                        );
                    }

                    --target;
                } else {
                    /* Decrease window size
                     * nextSize is less than current size. */
                    if (draft.idx < draft.end - 1) {
                        --draft.end;
                    } else if (draft.idx === draft.end - 1) {
                        ++draft.start;
                    } else {
                        // For dev
                        throw new Error(
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

            draft._winSize = nextSize;

            if (this.centerScroll) {
                this.centerIdx({ draft, LENGTH });
            }
        });

        if (!shallowEqualObjects(this.state, nextState)) {
            this.setState(nextState);
        }
    };

    /*
     * Covers for any logical errors that force the window out of bounds
     * */
    private constrainWindow = ({
        draft,
        LENGTH,
    }: {
        draft: HookState;
        LENGTH: number;
    }): void => {
        draft.start = Math.max(draft.start, 0);
        draft.end = Math.min(draft.end, LENGTH);

        // draft.idx = Math.min(draft.idx, draft.end - 1);
        // draft.idx = Math.max(draft.idx, draft.start);
    };

    private getTrueWindowSize = (start: number, end: number): number => {
        return Math.min(this.LENGTH, end) - start;
    };
}
