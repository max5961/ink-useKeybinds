import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import useKeybinds, { KbConfig } from "./useKeybinds.js";

const config1 = {
    quit: { input: "q" },
    greet: { input: "a" },
    switchCfg: { input: "b" },
    createErr: { key: "ctrl", input: "e" },
} satisfies KbConfig;

const config2 = {
    quit: { input: "q" },
    greet: { input: "c" },
    switchCfg: { input: "d" },
} satisfies KbConfig;

let count = 0;
export default function App(): React.ReactNode {
    const [msg, setMsg] = useState<string>("No commands yet!");
    const [isMainCfg, setIsMainCfg] = useState<boolean>(true);
    const [err, setErr] = useState<boolean>(false);
    const { exit } = useApp();

    const { onCmd, register, command } = useKeybinds(config1, {
        trackState: true,
        override: isMainCfg,
    });

    // ++count;
    // console.log(`isMainCfg  |  ${count}  |  ${isMainCfg}`);
    // console.log(`msg        |  ${count}  |  ${msg}\n`);

    onCmd("quit", () => {
        console.log("Quitting from config1");
        exit();
    });

    onCmd("createErr", () => {
        setErr(true);
    });

    onCmd("greet", () => {
        setMsg("'greet' from config1");
    });

    onCmd("switchCfg", () => {
        setMsg("'switchCfg from config1");
        setIsMainCfg(false);
    });

    const kb2 = useKeybinds(config2, { override: !isMainCfg });
    kb2.onCmd("quit", () => {
        console.log("Quitting from config2");
        exit();
    });
    kb2.onCmd("greet", () => {
        setMsg("'greet' from config2");
    });
    kb2.onCmd("switchCfg", () => {
        setMsg("'switchCfg' from config2");
        setIsMainCfg(true);
    });

    if (err) {
        return (
            <Box>
                //<Text></Text>
            </Box>
        );
    }

    useInput((i, k) => {
        if (i === "o" && k.ctrl) {
            exit();
        }
    });

    return (
        <>
            <Text color="blue">{isMainCfg ? "config1" : "config2"}</Text>
            <Text>
                Current command is:
                <Text color="green">{` ${msg}!`}</Text>
            </Text>
            <Box display="flex" flexDirection="column">
                <Text>{`Command: ${command}`}</Text>
                <Text>{`Register: ${register}`}</Text>
            </Box>
        </>
    );
}
