import { Box } from "ink";
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
        vertical: props.vertical ?? false,
        wordList: undefined,
    } satisfies SequenceTypes.Props;

    return (
        <Box
            width="100%"
            height="100%"
            borderStyle="bold"
            borderColor="magenta"
        >
            <Sequence {...sequenceProps} />
        </Box>
    );
}
