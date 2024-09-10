import { produce } from "immer";
import { HookState } from "./useList.js";
import assert from "assert";

type Params = {
    state: HookState;
    LENGTH: number;
    WINDOW_SIZE: number;
    nextSize: number;
    target: number | undefined;
};

function modifyWinSize({
    state,
    LENGTH,
    WINDOW_SIZE,
    nextSize,
    target = undefined,
}: Params): HookState {
    if (LENGTH === 0) return state;
    if (target === 0) return state;

    const clone = { ...state };

    target = target === undefined ? nextSize - WINDOW_SIZE : target;

    if (target > 0) {
        if (clone.end < LENGTH) {
            ++clone.end;
        } else if (clone.start > 0) {
            --clone.start;
        } else {
            //
        }
        --target;
    } else {
        if (clone.idx < clone.end - 1) {
            --clone.end;
        } else if (clone.idx <= clone.end - 1) {
            ++clone.start;
        } else {
            //
        }

        ++target;
    }

    return state;
}

// const nextState = produce(state, (clone) => {
//     nextSize = Math.abs(nextSize);
//     nextSize = Math.min(nextSize, LENGTH);
//
//     let target = nextSize - WINDOW_SIZE;
//     console.log(nextSize, WINDOW_SIZE, target);
//     while (target) {
//         /* nextSize is greater than current size.  It is also impossible
//          * to slice the idx out of frame when increasing the window */
//         if (target > 0) {
//             if (clone.end < LENGTH) {
//                 ++clone.end;
//             } else if (clone.start > 0) {
//                 --clone.start;
//             } else {
//                 // Since this is getting triggered sometimes, this entire
//                 // function needs to be a recursive function
//                 // For dev
//                 // assert(
//                 //     false,
//                 //     "Impossible case in modifyWinSize (inc win size)",
//                 // );
//             }
//
//             --target;
//         } else {
//             /* Since we are decreasing the window size it is possible to
//              * cut the idx out of frame. Cut from bottom as long as possible
//              * without cutting idx out of frame, then cut from top. */
//             if (clone.idx < clone.end - 1) {
//                 --clone.end;
//             } else if (clone.idx <= clone.end - 1) {
//                 ++clone.start;
//             } else {
//                 // For dev
//                 assert(
//                     false,
//                     "Impossible case in modifyWinSize (dec win size)",
//                 );
//             }
//
//             ++target;
//         }
//     }
//
//     // For dev
//     const msg = "idx out of range on window resize";
//     assert(clone.idx < clone.end && clone.idx >= clone.start, msg);
//
//     /* Just in case idx somehow gets out of frame after the resize */
//     clone.idx = Math.min(clone.idx, clone.end - 1);
//     clone.idx = Math.max(clone.idx, clone.start);
//     clone._winSize = nextSize;
//
//     // console.log(getTrueWindowSize(clone.start, clone.end));
//
//     if (opts.centerScroll) {
//         centerIdx(clone);
//     }
// });
//
// /* TODO: Split center scroll functions so that we can center after a window
//  * size adjustment */
// if (!shallowEqualObjects(state, nextState)) {
//     setState(nextState);
// }
