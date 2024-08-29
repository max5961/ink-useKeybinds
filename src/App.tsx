import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import useKeybinds, { KbConfig } from "./useKeybinds.js";
import { useFormInput } from "./useFormInput.js";
import Input from "./Input.js";

const config1 = {
    // Standalone non alphanumeric keys can trigger commands
    // just_return: { key: "return" },
} satisfies KbConfig;

const config2 = {
    //
} satisfies KbConfig;

export default function App(): React.ReactNode {
    const [msg, setMsg] = useState<string>("No commands yet!");
    const [throwErr, setThrowErr] = useState(false);
    const [override, setOverride] = useState(false);
    const { exit } = useApp();

    // const { onCmd, command, register } = useKeybinds(config1, {
    //     trackState: true,
    // });

    const { state, command, register } = useFormInput(
        { input: "i" },
        { key: "esc" },
    );

    const width = 15;
    return (
        <>
            <Text>
                Current command is:
                <Text color="green">{` ${msg}!`}</Text>
            </Text>
            <Box display="flex" flexDirection="column">
                <Text>{`Command: ${command}`}</Text>
                <Text>{`Register: ${register}`}</Text>
            </Box>
            <Box width={width} marginTop={1} marginLeft={1}>
                <Input text={state} placeholder="Enter email" />
            </Box>
            <Box
                borderTop={true}
                borderBottom={false}
                borderLeft={false}
                borderRight={false}
                marginTop={0}
                marginLeft={1}
                marginBottom={0}
                borderStyle="single"
                width={width}
            ></Box>
        </>
    );
}
