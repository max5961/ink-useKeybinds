import React, { useEffect, useState } from "react";
import { KeyBinds, useKeybinds } from "../use-keybinds/useKeybinds.js";
import { initialItems, Item } from "./initialData.js";
import { useTypedEvent } from "../use-keybinds/useEvent.js";
import { Box, Text, useApp } from "ink";
import { useList } from "../Components/List/useList.js";
import { SequenceTypes } from "../Components/Sequence/Sequence.js";
import { List } from "../Components/List/List.js";
import { useItem } from "../Components/Sequence/SequenceUnit/ItemContext.js";
import { useFormInput } from "../Components/Input/useFormInput.js";
import { Input } from "../Components/Input/Input.js";

const kbs1 = {
    foo: { input: "f" },
    bar: { input: "b" },
    quit: { input: "q" },
    // switchToTwo: { input: "2" },
    mark_complete: { key: "return" },
} satisfies KeyBinds;

const kbs2 = {
    bro: { input: "a" },
    dude: { input: "d" },
    switchToOne: { input: "1" },
    quit: { input: "q" },
} satisfies KeyBinds;

// const kbs3: KeyBinds = {
//     baz: { input: "0", foo: "yes" },
// };

export default function App(): React.ReactNode {
    const [items, setItems] = useState<Item[]>(initialItems);
    const { exit } = useApp();

    useKeybinds(kbs1);

    const { listState } = useList(items, { windowSize: 5 });

    const one = useTypedEvent<typeof kbs1>();

    one.useEvent("quit", quit);
    one.useEvent("foo", () => {
        console.log("foo");
    });
    one.useEvent("bar", () => {
        console.log("bar");
    });

    function quit() {
        console.log("quitting...");
        exit();
    }

    const listItems = items.map((item, idx) => {
        return (
            isFocus: boolean,
            event: SequenceTypes.OnEvent<typeof kbs1>,
        ) => {
            const color = isFocus ? "blue" : undefined;

            event("mark_complete", () => {
                const copy = items.slice();
                copy[idx] = { ...copy[idx], completed: !copy[idx].completed };
                setItems(copy);
            });

            const cmpIcon = item.completed ? " " : "  ";

            return <ListItem key={item.id} setItems={setItems} />;
        };
    });

    useEffect(() => {
        console.log("mounting....");

        return () => {
            console.log("unmounting app...");
        };
    }, []);

    return (
        <Box borderStyle="round" width="50">
            <List items={listItems} listState={listState} />
        </Box>
    );
}

function ListItem({
    setItems,
}: {
    setItems: (items: Item[]) => void;
}): React.ReactNode {
    const { items, item, index, isFocus } = useItem<Item[]>();

    const text = useFormInput({
        enter: { input: "i" },
        exit: { key: "return" },
        defaultVal: item.name,
        // active: isFocus,
    });

    function onSubmit() {
        const copy = items.slice();
        copy[index] = { ...item, name: text.str };
        setItems(copy);
    }

    const cmpIcon = item.completed ? " " : "  ";
    const color = isFocus ? "blue" : undefined;

    return (
        <Box display="flex">
            <Input text={text} color={color} onSubmit={onSubmit} />
            <Text color={color}>{cmpIcon}</Text>
        </Box>
    );
}

function Nested(): React.ReactNode {
    const { items, index } = useItem();
    const { useEvent } = useTypedEvent<typeof kbs1>();

    const item = items[index];

    useEvent("mark_complete", () => {
        console.log(`Toggling ${item.name}...`);
    });

    // useEvent("mark_complete", () => {
    //     console.log(
    //         `Item: ${item.name} is ${!item.completed ? "done" : "not done"}\n`,
    //     );
    // });

    return null;
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
