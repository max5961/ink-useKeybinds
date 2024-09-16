import { Box } from "ink";
import React, { PropsWithChildren } from "react";
import { List } from "../List/List.js";
import useList from "../List/useList.js";
import { KeyBinds, useKeybinds } from "../../use-keybinds/useKeybinds.js";
import { ItemGen } from "../List/List.js";

type Props = PropsWithChildren & {
    pages: (React.ReactNode | ItemGen<any>)[];
    pageState: any;
};

export function Pages({ pages, pageState }: Props): React.ReactNode {
    return (
        <Box width="100%" height="100%">
            <List
                items={pages}
                viewState={pageState}
                scrollBar={false}
                maintainState={true}
            />
        </Box>
    );
}

const pageNav = {
    nextPage: { key: "right" },
    prevPage: { key: "left" },
} satisfies KeyBinds;

export function usePages(
    pages: React.ReactNode[] | Function[],
    keybinds?: KeyBinds,
) {
    const { viewState, util } = useList(pages, {
        navigation: "none",
        circular: false,
        keybinds: keybinds ?? pageNav,
        windowSize: 1,
    });

    const { onEvent } = useKeybinds(pageNav);

    if (keybinds === undefined) {
        onEvent("nextPage", () => {
            util.nextItem();
        });

        onEvent("prevPage", () => {
            util.prevItem();
        });
    }

    const pageName =
        (pages[util.currentIndex] as React.ReactElement)?.props?.pageName ||
        null;

    const pageUtil = {
        nextPage: util.nextItem,
        prevPage: util.prevItem,
        goToPage: util.goToIndex,
        currentPage: util.currentIndex,
        currentPageName: pageName,
    };

    return { pageState: viewState, pageUtil };
}
