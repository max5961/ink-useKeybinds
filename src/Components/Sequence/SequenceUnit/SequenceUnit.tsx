import React from "react";
import { Box } from "ink";
import { SequenceTypes } from "../Sequence.js";
import { PageContext } from "./PageContext.js";
import { ItemContext } from "./ItemContext.js";
import {
    Listener,
    useMultipleEventsWithoutCtxChecks,
} from "../../../use-keybinds/useEvent.js";

export type Props = React.PropsWithChildren & {
    type: SequenceTypes.Type;
    isFocus: boolean;
    isHidden: boolean;
    maintainState: boolean;
    index: number;
    items: any;
    listeners: Listener[];
};

export function SequenceUnit({
    children,
    type,
    listeners,
    items,
    isFocus,
    index,
    isHidden,
    maintainState,
}: Props): React.ReactNode {
    useMultipleEventsWithoutCtxChecks(listeners);

    const dim = type === "PAGES" ? "100%" : undefined;

    const getUnits = () => {
        return (
            <>
                {isHidden && maintainState ? (
                    <Box height={0} width={0} overflow="hidden">
                        {children}
                    </Box>
                ) : !isHidden ? (
                    <Box height={dim} width={dim}>
                        {children}
                    </Box>
                ) : null}
            </>
        );
    };

    if (type === "PAGES") {
        return (
            <PageContext.Provider
                value={{
                    isFocus,
                    index,
                }}
            >
                {getUnits()}
            </PageContext.Provider>
        );
    }

    if (type === "ITEMS") {
        return (
            <ItemContext.Provider
                value={{
                    isFocus,
                    index,
                    items,
                }}
            >
                {getUnits()}
            </ItemContext.Provider>
        );
    }

    throw new Error("Unhandled sequence type");
}
