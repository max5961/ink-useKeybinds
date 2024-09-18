import React from "react";
import { Box, Text } from "ink";
import { useList } from "../Components/List/useList.js";
import { List } from "../Components/List/List.js";
import { useKeybinds } from "../use-keybinds/useKeybinds.js";

const colors: string[] = ["green", "yellow", "blue", "red", "cyan", "magenta"];

export default function PageTwo(): React.ReactNode {
    const { listState, listUtil } = useList(colors, {
        navigation: "none",
    });

    const { onEvent } = useKeybinds({
        nextItem: [{ input: "y" }, { input: "l" }],
        prevItem: [{ input: "t" }, { input: "h" }],
    });

    onEvent("nextItem", () => {
        listUtil.nextItem();
    });

    onEvent("prevItem", () => {
        listUtil.prevItem();
    });

    const items = colors.map((color) => {
        return (isFocus: boolean) => {
            return (
                <Box key={color}>
                    <Text inverse color={isFocus ? color : "gray"}>
                        {" "}
                    </Text>
                </Box>
            );
        };
    });

    return (
        <Box
            height="100%"
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderStyle="round"
        >
            <List
                items={items}
                listState={listState}
                direction="horizontal"
                scrollBar={true}
            />
        </Box>
    );
}

const memo = React.memo(PageTwo);
