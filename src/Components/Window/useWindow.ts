import { KeyBinds } from "../../use-keybinds/useKeybinds.js";
import { useSequence, UseSequenceTypes } from "../Sequence/useSequence.js";

export namespace UseWindow {
    export type Return = {
        windowState: UseSequenceTypes.ViewState;
        windowUtil: WindowUtil;
    };

    export type WindowUtil = {
        goToPage: UseSequenceTypes.Util["goToIndex"];
        nextPage: UseSequenceTypes.Util["nextItem"];
        prevPage: UseSequenceTypes.Util["prevItem"];
        currentPageIndex: UseSequenceTypes.Util["currentIndex"];
    };
}

const defaultKeybinds = {
    nextPage: { key: "right" },
    prevPage: { key: "left" },
} satisfies KeyBinds;

export function useWindow(
    pages: any[],
    opts?: UseSequenceTypes.Opts,
): UseWindow.Return {
    opts = opts || {};

    opts.windowSize = opts.windowSize ?? 1;
    opts.navigation = opts.navigation ?? "none";

    const { viewState, util } = useSequence(pages, opts);

    const windowUtil = {
        goToPage: util.goToIndex,
        nextPage: util.nextItem,
        prevPage: util.prevItem,
        currentPageIndex: util.currentIndex,
    } satisfies UseWindow.WindowUtil;

    return {
        windowState: viewState,
        windowUtil,
    };
}
