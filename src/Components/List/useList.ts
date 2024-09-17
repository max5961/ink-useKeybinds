import { useSequence, UseSequenceTypes } from "../Sequence/useSequence.js";

export namespace UseList {
    export type Return = {
        listState: UseSequenceTypes.ViewState;
        listUtil: UseSequenceTypes.Util;
    };
}

export function useList(
    ...args: Parameters<typeof useSequence>
): UseList.Return {
    const { viewState, util } = useSequence(...args);

    return { listState: viewState, listUtil: util };
}
