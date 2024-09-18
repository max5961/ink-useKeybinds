import React, { useState } from "react";
import { initialItems, keybinds, Item } from "./initialData.js";
import { Box, Text } from "ink";
import { useOnCmd } from "../Components/CommandLine/CommandLine.js";
import { List } from "../Components/List/List.js";
import { useItem } from "../Components/Sequence/SequenceUnit/ItemContext.js";
import { useFormInput } from "../Components/Input/useFormInput.js";
import { Input } from "../Components/Input/Input.js";
import { KeyBinds, OnItem, useKeybinds } from "../use-keybinds/useKeybinds.js";
import { useList } from "../Components/List/useList.js";
import { usePageFocus } from "../Components/Sequence/SequenceUnit/PageContext.js";
import { commands } from "./root.js";

export const pageOneKbs = {
    toggleDone: { key: "return" },
    updateShoutout: [{ input: " s" }, { input: " o" }],
    deleteItem: { input: "dd" },
    windowSize0: { input: "w0" },
    windowSizeMax: { input: "wm" },
    incSubCount: { input: "l" },
    decSubCount: { input: "h" },
    expand: { input: "e" },
} satisfies KeyBinds;

export default function PageOne(): React.ReactNode {
    const [items, setItems] = useState(initialItems);
    const [shoutout, setShoutout] = useState<string>("");
    const [exp, setExp] = useState(true);

    const { listState, listUtil } = useList(items, {
        keybinds: pageOneKbs,
        windowSize: 5,
        navigation: "vi-vertical",
        centerScroll: true,
        circular: false,
        vertical: true,
    });

    const onCmd = useOnCmd<typeof commands>();
    const { onEvent } = useKeybinds(pageOneKbs);

    onCmd("foo", () => {
        setShoutout("foo shoutout");
    });

    onCmd("bar", () => {
        setShoutout("bar shoutout");
    });

    onEvent("expand", () => {
        if (exp) {
            listUtil.modifyWinSize(1);
        } else {
            listUtil.modifyWinSize(Infinity);
        }
        setExp(!exp);
    });

    onEvent("windowSize0", () => {
        listUtil.modifyWinSize(0);
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

    const wordList = items.map((i) => i.name);
    const isPageFocus = usePageFocus();
    const borderColor = isPageFocus ? "cyan" : undefined;

    return (
        <Box
            height="100%"
            width="100%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            borderColor={borderColor}
        >
            <Text>{`Last shoutout was: ${shoutout}`}</Text>
            <Box borderStyle="round" borderColor="white" width={50}>
                <List
                    items={itemGens}
                    listState={listState}
                    wordList={wordList}
                    scrollBar={true}
                    scrollBarPosition="post"
                    scrollColor="cyan"
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
        typeof pageOneKbs,
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

    const { onEvent } = useKeybinds({ sayItem: { key: "f6" } });

    onEvent("sayItem", () => {
        console.log(item.name);
    });

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

const NestedListItem = React.memo(function NestedListItem(): React.ReactNode {
    const [state, setState] = useState<number>(0);

    const { onItem, isFocus } = useItem<typeof pageOneKbs>();

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
});
