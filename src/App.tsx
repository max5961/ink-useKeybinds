import React, { useState } from "react";
import { Box, Text } from "ink";
import useKeybinds, { KbConfig } from "./useKeybinds.js";

const kbs = {
    // 'f' input triggers 'foo' command
    foo: { input: "f" },

    // Multiple inputs can trigger the same command
    bar: [{ input: "b" }, { input: "a" }, { input: "r" }],

    // Input can be up to 2 chars long
    quz: { input: "qq" },

    // Uppercase input is separate from lowercase
    FOO: [{ input: "F" }, { input: "O" }],

    // Uppercase and lowercase input can be mixed
    BAR: [{ input: "Ba" }, { input: "Br" }],
    QUZ: [{ input: "qQ" }, { input: "Qq" }],

    downArrow: { key: "downArrow" },

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

    const { data, emitter } = useKeybinds(
        kbs,
        (cmd) => {
            if (cmd === "just_return") {
                setMsg("just_return triggered");
            }

            if (cmd === "ctrl_foobar") {
                setMsg("ctrl_foobar triggered");
            }

            if (cmd === "foo") {
                setMsg("foo triggered");
            }

            if (cmd === "bar") {
                setMsg("bar triggered");
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

            if (cmd === "QUZ") {
                setMsg("QUZ triggered");
            }

            if (cmd === "downArrow") {
                setMsg("downArrow triggered");
            }
        },
        { trackState: true },
    );

    return (
        <>
            <Text>
                Current command is:
                <Text color="green">{` ${msg}!`}</Text>
            </Text>
            <Box display="flex" flexDirection="column">
                <Text>{`Command: ${data.command ? data.command : ""}`}</Text>
                <Text>{`Register: ${data.register}`}</Text>
            </Box>
        </>
    );
}
