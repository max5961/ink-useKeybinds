import React from "react";
import { SequenceTypes, Sequence } from "../Sequence/Sequence.js";

type Props = Omit<
    SequenceTypes.Props,
    "type" | "viewState" | "items" | "wordList"
> & {
    windowState: SequenceTypes.Props["viewState"];
    pages: SequenceTypes.Props["items"];
};

export function Window(props: Props): React.ReactNode {
    const sequenceProps = {
        type: "PAGES",
        items: props.pages,
        viewState: props.windowState,
        scrollBar: props.scrollBar ?? false,
        scrollColor: props.scrollColor ?? "white",
        scrollBarPosition: props.scrollBarPosition ?? "post",
        direction: props.direction ?? "vertical",
        wordList: undefined,
    } satisfies SequenceTypes.Props;

    return <Sequence {...sequenceProps} />;
}
