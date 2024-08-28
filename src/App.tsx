import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import useKeybinds, { KbConfig } from "./useKeybinds.js";

const kbConfig = {
    quit: { input: "q" },

    // 'f' input triggers 'foo' command
    foo: { input: "f" },

    // Multiple inputs can trigger the same command
    bar: [{ input: "b" }, { input: "a" }, { input: "r" }],

    // Input can be up to 2 chars long
    quz: { input: "uu" },

    // Uppercase input is separate from lowercase
    FOO: [{ input: "F" }, { input: "O" }],

    // Uppercase and lowercase input can be mixed
    BAR: [{ input: "Ba" }, { input: "Br" }],

    throwError: { input: "e" },

    down: { key: "down" },
    up: { key: "up" },
    left: { key: "left" },
    right: { key: "right" },

    ctrl_f: { input: "f", key: "ctrl" },
    ctrl_a: { input: "a", key: "ctrl" },

    // Standalone non alphanumeric keys can trigger commands
    just_return: { key: "return" },
} satisfies KbConfig;

export default function App(): React.ReactNode {
    const [msg, setMsg] = useState<string>("No commands yet!");
    const [throwErr, setThrowErr] = useState(false);
    const { exit } = useApp();

    const { onCmd, command, register } = useKeybinds(kbConfig, {
        trackState: true,
    });

    onCmd("just_return", () => {
        setMsg("just return triggered");
    });

    onCmd("quit", () => {
        exit();
    });

    onCmd("ctrl_a", () => {
        setMsg("ctrl_a triggerdd");
    });

    onCmd("ctrl_f", () => {
        setMsg("ctrl_f triggered");
    });

    onCmd("foo", () => {
        setMsg("foo trigger brah");
    });

    onCmd("quz", () => {
        setMsg("quz triggered");
    });

    onCmd("FOO", () => {
        setMsg("FOO triggered");
    });

    onCmd("BAR", () => {
        setMsg("BAR triggered");
    });

    onCmd("throwError", () => {
        setThrowErr(true);
    });

    // Compatible with useInput
    useInput((input, key) => {
        if (input === "z") {
            console.log("z from useInput");
        }
    });

    if (throwErr) {
        return <>//</>;
    }

    return (
        <>
            <Text>
                Current command is:
                <Text color="green">{` ${msg}!`}</Text>
            </Text>
            <Box display="flex" flexDirection="column">
                <Text>{`Command: ${command ? command : ""}`}</Text>
                <Text>{`Register: ${register}`}</Text>
            </Box>
        </>
    );
}
