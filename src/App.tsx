import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import useKeybinds, { KbConfig } from "./useKeybinds.js";

const kbs = {
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

    quit: [{ input: "q" }],

    downArrow: { key: "down" },

    ctrl_foobar: [
        // Non alphanumeric keys can be mixed with lowercase chars
        { input: "fb", key: "ctrl" },

        // Non alphanumeric keys CANNOT be mixed with uppercase chars
        { input: "FB", key: "ctrl" },
    ],

    // Standalone non alphanumeric keys can trigger commands
    just_return: { key: "return" },
} satisfies KbConfig;

export default function App(): React.ReactNode {
    const [msg, setMsg] = useState<string>("No commands yet!");
    const [a, setA] = useState(false);
    const { exit } = useApp();

    const { onCmd, command, register } = useKeybinds(kbs, { trackState: true });

    onCmd("just_return", () => {
        setMsg("just return triggered");
    });

    onCmd("quit", () => {
        exit();
    });

    onCmd("ctrl_foobar", () => {
        setMsg("ctrl_foobar triggered");
    });

    onCmd("foo", () => {
        setMsg("foo trigger brah");
    });

    onCmd("quz", () => {
        setMsg("quz triggered");
        setA(!a);
    });

    onCmd("FOO", () => {
        setMsg("FOO triggered");
    });

    onCmd("BAR", () => {
        setMsg("BAR triggered");
    });

    onCmd("downArrow", () => {
        setMsg("downArrow triggered");
    });

    // Compatible with useInput
    useInput((input, key) => {
        if (input === "b") {
            console.log("b from useInput");
        }
    });

    if (a) {
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
