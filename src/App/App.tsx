import React from "react";
import PageOne from "./PageOne.js";
import PageTwo from "./PageTwo.js";
import PageThree from "./PageThree.js";
import { useWindow } from "../Components/Window/useWindow.js";
import { Window } from "../Components/Window/Window.js";
import { KeyBinds, useKeybinds } from "../use-keybinds/useKeybinds.js";
import { useApp } from "ink";
import { useOnApp } from "../use-keybinds/KeybindsProvider.js";
import { keybinds } from "./initialData.js";

const pages = [
    <PageOne key="PageOne" />,
    <PageTwo key="PageTwo" />,
    <PageThree key="PageThree" />,
];

const pageNav = {
    pageOne: { input: "1" },
    pageTwo: { input: "2" },
    pageThree: { input: "3" },
    nextPage: [{ key: "right" }, { key: "ctrl", input: "j" }],
    prevPage: [{ key: "left" }, { key: "ctrl", input: "k" }],
} satisfies KeyBinds;

export default function App(): React.ReactNode {
    const { exit } = useApp();

    const { windowState, windowUtil } = useWindow(pages, {
        circular: true,
    });
    const { onEvent } = useKeybinds(pageNav);
    const { onApp } = useOnApp<typeof keybinds>();

    onEvent("pageOne", () => {
        windowUtil.goToPage(0);
    });

    onEvent("pageTwo", () => {
        windowUtil.goToPage(1);
    });

    onEvent("pageThree", () => {
        windowUtil.goToPage(2);
    });

    onEvent("nextPage", () => {
        windowUtil.nextPage();
    });

    onEvent("prevPage", () => {
        windowUtil.prevPage();
    });

    onApp("quit", () => {
        exit();
    });

    return <Window pages={pages} windowState={windowState} scrollBar={true} />;
}
