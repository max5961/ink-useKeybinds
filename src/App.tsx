import React, { useState } from "react";
import { Box, Text, useApp } from "ink";
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

    const { command, register } = useKeybinds(
        (cmd) => {
            if (cmd === "just_return") {
                setMsg("just_return triggered");
            }

            if (cmd === "quit") {
                process.exit();
            }

            if (cmd === "ctrl_foobar") {
                setMsg("ctrl_foobar triggered");
            }

            if (cmd === "foo") {
                setMsg("foo triggered");
                setA(!a);
            }

            if (cmd === "bar") {
                setMsg("bar triggered");
                exit();
            }

            if (cmd === "quz") {
                setMsg("quz triggered");
            }

            if (cmd === "FOO") {
                setMsg("FOO triggered");
            }

            if (cmd === "BAR") {
                setMsg("BAR triggered");
            }

            if (cmd === "downArrow") {
                setMsg("downArrow triggered");
            }
        },
        kbs,
        { trackState: true },
    );

    useKeybinds(
        (cmd) => {
            if (cmd === "just_return") {
                setMsg("This should never run");
            }
            if (cmd === "quit") {
                process.exit();
            }

            if (cmd === "ctrl_foobar") {
                setMsg("This should never run");
            }

            if (cmd === "foo") {
                setMsg("This should never run");
            }

            if (cmd === "bar") {
                setMsg("This should never run");
            }

            if (cmd === "quz") {
                setMsg("This should never run");
            }

            if (cmd === "FOO") {
                setMsg("This should never run");
            }

            if (cmd === "BAR") {
                setMsg("This should never run");
            }

            if (cmd === "downArrow") {
                setMsg("This should never run");
            }
        },
        kbs,
        { trackState: true },
    );

    // <Text>{`Register: ${register}`}</Text>
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
            </Box>
        </>
    );
}
