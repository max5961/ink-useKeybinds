import { KeyBinds } from "../../use-keybinds/useKeybinds.js";
import { useSequence, UseSequenceTypes } from "../Sequence/useSequence.js";

export namespace UseList {
    export type Return<T extends KeyBinds = any> = {
        listState: UseSequenceTypes.ViewState;
        listUtil: UseSequenceTypes.Util;
    };
}

export function useList(
    // ...args: Parameters<typeof useSequence>
    items: unknown[],
    opts: UseSequenceTypes.Opts = {},
): UseList.Return {
    const { viewState, util } = useSequence(items, opts);

    return { listState: viewState, listUtil: util };
}
