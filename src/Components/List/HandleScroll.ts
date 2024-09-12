import { HookState, Opts } from "./useList.js";
import { produce } from "immer";
import { shallowEqualObjects } from "shallow-equal";

type Init = {
    state: HookState;
    setState(newState: HookState): void;
    LENGTH: number;
    WINDOW_SIZE: number;
    opts: Opts;
};

export class HandleScroll {
    private readonly state: HookState;
    private readonly setState: (newState: HookState) => void;
    private readonly LENGTH: number;
    private readonly WINDOW_SIZE: number;
    private readonly centerScroll: boolean;
    private readonly circular: boolean;

    constructor({ state, setState, LENGTH, WINDOW_SIZE, opts }: Init) {
        this.state = state;
        this.setState = setState;
        this.LENGTH = LENGTH;
        this.WINDOW_SIZE = WINDOW_SIZE;
        this.centerScroll = opts.centerScroll ?? false;
        this.circular = opts.circular ?? false;
    }

    getFunctions = () => {
        return {
            handle: this.handle,
            nextItem: this.nextItem,
            prevItem: this.prevItem,
            goToIndex: this.goToIndex,
            modifyWinSize: this.modifyWinSize,
            scrollUp: this.scrollUp,
            scrollDown: this.scrollDown,
        };
    };

    /*
     * Entry point that executes on every re-render.  Splits control to modify
     * window for center or normal scroll.  Why not execute handle on a
     * useEffect dependency instead? Not sure right now...I might have had a
     * reason for doing it this way though.
     * */
    handle = (nextIdx: number = this.state.idx): void => {
        // console.log(this.state.start, this.state.end);
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
        // list is hidden
        if (this.state.start === this.state.end) return;

        if (this.circular && this.state.idx === this.LENGTH - 1) {
            return this.handle(0);
        }

        if (this.state.idx >= this.LENGTH - 1) return;

        this.handle(this.state.idx + 1);
    };

    prevItem = (): void => {
        // list is hidden
        if (this.state.start === this.state.end) return;

        if (this.circular && this.state.idx <= 0) {
            return this.handle(this.LENGTH - 1);
        }

        if (this.state.idx <= 0) return;

        this.handle(this.state.idx - 1);
    };

    scrollDown = (): void => {
        const half = Math.floor(this.WINDOW_SIZE / 2);
        const nextIdx = this.state.idx + half;

        if (this.circular && nextIdx >= this.LENGTH) {
            const dif = this.LENGTH - this.state.idx - 1;
            return this.goToIndex(half - dif - 1);
        }

        this.goToIndex(Math.min(this.LENGTH - 1, nextIdx));
    };

    scrollUp = (): void => {
        const half = Math.floor(this.WINDOW_SIZE / 2);
        const nextIdx = this.state.idx - half;

        if (this.circular && nextIdx < 0) {
            const dif = half - this.state.idx;
            return this.goToIndex(this.LENGTH - dif);
        }

        this.goToIndex(Math.max(0, nextIdx));
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
                this.inRange(draft, "bro");
            }

            this.constrainWindow({ draft, LENGTH });
            draft.idx = Math.min(nextIdx, LENGTH - 1);
            draft.idx = Math.max(0, draft.idx);

            // next idx out of range (goToIndex)
            while (draft.idx >= draft.end && draft.end < LENGTH) {
                ++draft.end;
                ++draft.start;
                this.inRange(draft, "bro");
            }
            while (draft.idx < draft.start && draft.start >= 0) {
                --draft.end;
                --draft.start;
                this.inRange(draft, "bro");
            }

            // next idx 'bumps' into next viewing window
            if (draft.idx === draft.end && draft.end < LENGTH) {
                ++draft.start;
                ++draft.end;
                this.inRange(draft, "bro");
                return;
            }
            if (draft.idx === draft.start - 1 && draft.start > 0) {
                --draft.start;
                --draft.end;
                this.inRange(draft, "bro");
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

            // let trueWindowSize = getTrueWindowSize();
            let trueWindowSize = this.getTrueWindowSize(draft.start, draft.end);
            while (trueWindowSize < WINDOW_SIZE && trueWindowSize < LENGTH) {
                --draft.start;
                --draft.end;
                trueWindowSize = this.getTrueWindowSize(draft.start, draft.end);

                this.inRange(draft, "bro");
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
                this.inRange(draft, "bro");
            }
            while (draft.idx < draft.start && draft.start >= 0) {
                --draft.end;
                --draft.start;
                this.inRange(draft, "bro");
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
        const getMid = (s: number, e: number) => Math.floor((s + e) / 2);

        // prettier-ignore
        while (draft.idx > getMid(draft.start, draft.end) && draft.end < LENGTH) {
            ++draft.start;
            ++draft.end;
            this.inRange(draft, "bro");
        }
        while (draft.idx < getMid(draft.start, draft.end) && draft.start > 0) {
            --draft.start;
            --draft.end;
            this.inRange(draft, "bro");
        }
    };

    /* slice to 0 win size should not put start above idx, and 0 - max is
     * flipping start and end  */
    modifyWinSize = (nextSize: number): void => {
        const LENGTH = this.LENGTH;
        const WINDOW_SIZE = this.WINDOW_SIZE;

        if (LENGTH === 0) return;

        const nextState = produce(this.state, (draft) => {
            nextSize = Math.abs(nextSize);
            nextSize = Math.min(nextSize, LENGTH);

            if (nextSize === 0) {
                draft.start = draft.end = draft.idx;
            }

            let target = nextSize === 0 ? 0 : nextSize - WINDOW_SIZE;
            while (target) {
                /* Increase window size
                 * nextSize is greater than current size. */
                if (target > 0) {
                    if (draft.end < LENGTH) {
                        ++draft.end;
                    } else if (draft.start > 0) {
                        --draft.start;
                    } else {
                        throw new Error("modifyWinSize (inc win size)");
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
                        throw new Error("modifyWinSize (dec win size)");
                    }

                    ++target;
                }
            }

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

        if (this.WINDOW_SIZE !== 0) {
            draft.idx = Math.min(draft.idx, draft.end - 1);
            draft.idx = Math.max(draft.idx, draft.start);
        }
    };

    /*
     * Deletions reduce LENGTH while keeping end indexes the same.
     * */
    private getTrueWindowSize = (start: number, end: number): number => {
        return Math.min(this.LENGTH, end) - start;
    };

    /* Throws an error if out of range and prevents/catches endless loops for
     * development */
    private inRange(draft: HookState, msg: string): void {
        if (
            draft.start >= 0 &&
            draft.start <= draft.end &&
            draft.end <= this.LENGTH
        ) {
            return;
        }

        throw new Error(msg);
    }
}
