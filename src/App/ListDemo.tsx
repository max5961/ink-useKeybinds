import React, { useState } from "react";
import { initialItems, Item, keybinds } from "./initialData.js";
import useList from "../Components/List/useList.js";
import { OnEvent } from "../use-keybinds/useKeybinds.js";
import { Box, Text, useApp } from "ink";
import { List } from "../Components/List/List.js";
import { useIsFocus, useOnItem } from "../Components/List/ListItem.js";
import { useOnEvent } from "../use-keybinds/KeybindsProvider.js";
import { useFormInput } from "../Components/Input/useFormInput.js";
import { Input } from "../Components/Input/Input.js";
import { useOnCmd } from "../Components/CommandLine/CommandLine.js";

function App(): React.ReactNode {
    const [items, setItems] = useState(initialItems);
    const [shoutout, setShoutout] = useState<string>("");
    const [exp, setExp] = useState(true);
    const { exit } = useApp();

    const { viewState, util } = useList(items.length, {
        keybinds,
        windowSize: 7,
        navigation: "vi",
        centerScroll: false,
        circular: false,
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

    const itemGen = items.map((desc, idx) => {
        return (isFocus: boolean, onItem: OnEvent<typeof keybinds>) => {
            onItem("deleteItem", () => {
                const copy = items.slice();
                copy.splice(idx, 1);
                setItems(copy);
            });

            onItem("toggleDone", () => {
                const copy = items.slice();
                copy[idx] = {
                    ...copy[idx],
                    completed: !copy[idx].completed,
                };
                setItems(copy);
            });

            onItem("updateShoutout", () => {
                setShoutout(desc.id.slice(0, 5));
            });

            return (
                <ListItem
                    key={desc.id}
                    {...{ items, setItems, idx, isFocus }}
                />
            );
        };
    });

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
                    itemGenerators={itemGen}
                    viewState={viewState}
                    wordList={wordList}
                    scrollBar={true}
                    scrollBarPosition="post"
                    scrollColor="blue"
                />
            </Box>
        </Box>
    );
}

type LIProps = {
    items: Item[];
    setItems: (items: Item[]) => void;
    isFocus: boolean;
    idx: number;
};

function ListItem({ isFocus, items, idx, setItems }: LIProps): React.ReactNode {
    const item = items[idx];

    const text = useFormInput({
        enter: { input: "i" },
        exit: { key: "esc" },
        defaultVal: item.name,
        active: isFocus,
    });

    function onSubmit() {
        const copy = items.slice();
        copy[idx] = { ...item, name: text.str };
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

    const onCmd = useOnItem<typeof keybinds>();
    const isFocus = useIsFocus();

    const color = isFocus ? "blue" : "";

    onCmd("incSubCount", () => {
        setState(state + 1);
    });

    onCmd("decSubCount", () => {
        setState(state - 1);
    });

    return (
        <>
            <Text color={color}>{` ${state}`}</Text>
        </>
    );
}

console.log("listening...\n");
