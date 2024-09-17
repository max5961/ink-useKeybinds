import React from "react";
import { Box } from "ink";
import { OnUnit } from "../../../use-keybinds/useKeybinds.js";
import EventEmitter from "events";
import { SequenceTypes } from "../Sequence.js";
import { PageContext } from "./PageContext.js";
import { ItemContext } from "./ItemContext.js";

export type Props = React.PropsWithChildren & {
    type: SequenceTypes.Type;
    isFocus: boolean;
    onUnit: OnUnit;
    emitter: EventEmitter;
    isHidden: boolean;
    maintainState: boolean;
    index: number;
    items: any;
};

export function SequenceUnit({
    children,
    type,
    onUnit,
    items,
    isFocus,
    emitter,
    index,
    isHidden,
    maintainState,
}: Props): React.ReactNode {
    const getUnits = () => {
        return (
            <>
                {isHidden && maintainState ? (
                    <Box height={0} width={0} overflow="hidden">
                        {children}
                    </Box>
                ) : !isHidden ? (
                    <Box>{children}</Box>
                ) : null}
            </>
        );
    };

    if (type === "PAGES") {
        return (
            <PageContext.Provider
                value={{
                    onPage: onUnit,
                    isFocus,
                    index,
                    emitter,
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
                    onItem: onUnit,
                    isFocus,
                    emitter,
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
