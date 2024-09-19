import React, { useEffect, useState } from "react";
import { KeyBinds, useKeybinds } from "../use-keybinds/useKeybinds.js";
import { keybinds, initialItems, Item } from "./initialData.js";
import { useTypedEvent } from "../use-keybinds/useEvent.js";
import { Text, useApp } from "ink";

const appkbs = {
    foo: { input: "f" },
    bar: { input: "b" },
    quit: { input: "q" },
} satisfies KeyBinds;

let i = 0;
export default function App(): React.ReactNode {
    console.log(++i);
    const [items, setItems] = useState<Item[]>(initialItems);

    useKeybinds(appkbs);
    const { useEvent } = useTypedEvent<typeof appkbs>();
    const { exit } = useApp();

    useEvent("quit", () => {
        console.log("quitting...");
        exit();
    });

    useEvent("foo", () => {
        console.log("fooooooooo");
    });

    useEvent("bar", () => {
        console.log("barrrrrrr");
    });

    return <Text>{"\nhello brah"}</Text>;
}

// import React from "react";
// import PageOne from "./PageOne.js";
// import PageTwo from "./PageTwo.js";
// import PageThree from "./PageThree.js";
// import { useWindow } from "../Components/Window/useWindow.js";
// import { Window } from "../Components/Window/Window.js";
// import { KeyBinds, useKeybinds } from "../use-keybinds/useKeybinds.js";
// import { useApp } from "ink";
// import { useOnApp } from "../use-keybinds/KeybindsProvider.js";
// import { keybinds } from "./initialData.js";
//
// const pages = [
//     <PageOne key="PageOne" />,
//     <PageTwo key="PageTwo" />,
//     <PageThree key="PageThree" />,
// ];
//
// const pageNav = {
//     pageOne: { input: "1" },
//     pageTwo: { input: "2" },
//     pageThree: { input: "3" },
//     nextPage: [{ key: "right" }, { key: "ctrl", input: "j" }],
//     prevPage: [{ key: "left" }, { key: "ctrl", input: "k" }],
// } satisfies KeyBinds;
//
// export default function App(): React.ReactNode {
//     const { exit } = useApp();
//
//     const { windowState, windowUtil } = useWindow(pages, {
//         circular: true,
//     });
//     const { onEvent } = useKeybinds(pageNav);
//     const { onApp } = useOnApp<typeof keybinds>();
//
//     onEvent("pageOne", () => {
//         windowUtil.goToPage(0);
//     });
//
//     onEvent("pageTwo", () => {
//         windowUtil.goToPage(1);
//     });
//
//     onEvent("pageThree", () => {
//         windowUtil.goToPage(2);
//     });
//
//     onEvent("nextPage", () => {
//         windowUtil.nextPage();
//     });
//
//     onEvent("prevPage", () => {
//         windowUtil.prevPage();
//     });
//
//     onApp("quit", () => {
//         exit();
//     });
//
//     return <Window pages={pages} windowState={windowState} scrollBar={true} />;
// }
