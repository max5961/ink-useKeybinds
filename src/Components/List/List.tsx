import React, { ReactNode } from "react";
import { KeyBinds } from "../../use-keybinds/useKeybinds.js";
import { Sequence, SequenceTypes } from "../Sequence/Sequence.js";
import { UseSequenceTypes } from "../Sequence/useSequence.js";
import { Box } from "ink";

type Props<T extends KeyBinds = any> = Omit<
    SequenceTypes.Props<T>,
    "type" | "viewState"
> & { listState: UseSequenceTypes.ViewState };

export function List<T extends KeyBinds = any>(props: Props<T>): ReactNode {
    const sequenceProps = {
        type: "ITEMS",
        items: props.items,
        viewState: props.listState,
        vertical: props.vertical ?? true,
        wordList: props.wordList ?? undefined,
        scrollBar: props.scrollBar ?? true,
        scrollColor: props.scrollColor ?? "white",
        scrollBarPosition: props.scrollBarPosition ?? "post",
    } satisfies SequenceTypes.Props;

    return <Sequence {...sequenceProps} />;
}
