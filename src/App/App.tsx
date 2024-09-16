import { Box, Text } from "ink";
import React from "react";
import PageOne from "./PageOne.js";
import PageTwo from "./PageTwo.js";
import { usePages, Pages } from "../Components/Pages/Pages.js";
import { KeyBinds, useKeybinds } from "../use-keybinds/useKeybinds.js";

const pageNav = {
    pageOne: { input: "1" },
    pageTwo: { input: "2" },
} satisfies KeyBinds;

export default function App(): React.ReactNode {
    const pages = [<PageOne key="Page One" />, <PageTwo key="Page Two" />];

    const { pageState, pageUtil } = usePages(pages, {});

    const { onEvent } = useKeybinds(pageNav);

    onEvent("pageOne", () => {
        pageUtil.goToPage(0);
    });

    onEvent("pageTwo", () => {
        pageUtil.goToPage(1);
    });

    const pageName = pageUtil.currentPage === 0 ? "Page One" : "Page Two";

    return (
        <Box height={25} width={75} borderStyle="round">
            <Pages pageState={pageState} pages={pages} />
            <Text>{pageName}</Text>
        </Box>
    );
}

console.log("listening...\n");
