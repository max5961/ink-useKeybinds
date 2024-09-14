import React, { useState } from "react";
import { initialItems, Item, keybinds } from "./initialData.js";
import useList from "../Components/List/useList.js";
import { OnItem } from "../use-keybinds/useKeybinds.js";
import { Box, Text, useApp } from "ink";
import { List } from "../Components/List/List.js";
import { useItem } from "../Components/List/ListItem.js";
import { useOnEvent } from "../use-keybinds/KeybindsProvider.js";
import { useFormInput } from "../Components/Input/useFormInput.js";
import { Input } from "../Components/Input/Input.js";
import { useOnCmd } from "../Components/CommandLine/CommandLine.js";

export default function App(): React.ReactNode {
    const [items, setItems] = useState(initialItems);
    const [shoutout, setShoutout] = useState<string>("");
    const [exp, setExp] = useState(true);
    const { exit } = useApp();

    const { viewState, util } = useList(items, {
        keybinds,
        windowSize: 5,
        navigation: "vi",
        centerScroll: true,
        circular: true,
        vertical: true,
    });

    const onEvent = useOnEvent<typeof keybinds>();
    const onCmd = useOnCmd();

    onCmd("foo", () => {
        setShoutout("foo shoutout");
    });

    onCmd("bar", () => {
        setShoutout("bar shoutout");
    });

    onEvent("expand", () => {
        if (exp) {
            util.modifyWinSize(1);
        } else {
            util.modifyWinSize(Infinity);
        }
        setExp(!exp);
    });

    onEvent("windowSize0", () => {
        util.modifyWinSize(0);
    });

    onEvent("quit", () => {
        exit();
    });

    let i = 0;
    const itemGens = items.map((desc, idx) => {
        if (++i % 2 === 0) {
            return (
                <ListItem
                    key={desc.id}
                    setItems={setItems}
                    setShoutout={setShoutout}
                />
            );
        }

        return (isFocus: boolean, onItem: OnItem<typeof keybinds>) => {
            return (
                <ListItem
                    key={desc.id}
                    setItems={setItems}
                    setShoutout={setShoutout}
                />
            );
        };
    });

    // const itemGens = items.map((desc, idx) => {
    //     return (
    //         <ListItem
    //             key={desc.id}
    //             setItems={setItems}
    //             setShoutout={setShoutout}
    //         />
    //     );
    // });

    const wordList = items.map((i) => i.name);

    return (
        <Box
            width="100"
            height="100"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <Text>{`Last shoutout was: ${shoutout}`}</Text>
            <Box borderStyle="round" width={50} borderColor="gray">
                <List
                    items={itemGens}
                    viewState={viewState}
                    wordList={wordList}
                    scrollBar={true}
                    scrollBarPosition="post"
                    scrollColor="blue"
                    maintainState={true}
                />
            </Box>
        </Box>
    );
}

type LIProps = {
    setItems: (items: Item[]) => void;
    setShoutout: (s: string) => void;
};

function ListItem({ setItems, setShoutout }: LIProps): React.ReactNode {
    const { onItem, isFocus, index, items } = useItem<
        typeof keybinds,
        Item[]
    >();

    onItem("deleteItem", () => {
        const copy = items.slice();
        copy.splice(index, 1);
        setItems(copy);
    });

    onItem("toggleDone", () => {
        const copy = items.slice();
        copy[index] = {
            ...copy[index],
            completed: !copy[index].completed,
        };
        setItems(copy);
    });

    onItem("updateShoutout", () => {
        setShoutout(items[index].id.slice(0, 5));
    });

    const item = items[index];

    const text = useFormInput({
        enter: { input: "i" },
        exit: { key: "return" },
        defaultVal: item.name,
        active: isFocus,
    });

    function onSubmit() {
        const copy = items.slice();
        copy[index] = { ...item, name: text.str };
        setItems(copy);
    }

    const color = isFocus ? "blue" : "";
    const focusCaret = isFocus ? ">" : " ";
    let cmpIcon = "";
    if (item.completed) {
        cmpIcon = " ";
    }

    return (
        <Box display="flex" justifyContent="space-between">
            <Text color={color}>
                {`${focusCaret} item ${item.id.slice(0, 5)}: `}
            </Text>
            <Input text={text} color={color} onSubmit={onSubmit} />
            <Text color={color}>{cmpIcon}</Text>
            <NestedListItem />
        </Box>
    );
}

function NestedListItem(): React.ReactNode {
    const [state, setState] = useState<number>(0);

    const { onItem, isFocus } = useItem<typeof keybinds>();

    const color = isFocus ? "blue" : "";

    onItem("incSubCount", () => {
        setState(state + 1);
    });

    onItem("decSubCount", () => {
        setState(state - 1);
    });

    return (
        <>
            <Text color={color}>{` ${state}`}</Text>
        </>
    );
}

console.log("listening...\n");
