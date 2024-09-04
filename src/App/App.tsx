import React, { useState } from "react";
import { Box, Text, useApp } from "ink";
import KeybindProcessingGate from "../KeybindProcessingGate.js";
import KbState from "../Components/KbState/KbState.js";
import Input from "../Components/Input/Input.js";
import { useFormInput } from "../Components/Input/useFormInput.js";
import { KbConfig } from "../useKeybinds.js";
import Keybinds, { useOnCmd } from "../Keybinds.js";

const kbs = {
    bro: { input: "b" },
    ctrlA: { key: "ctrl", input: "a" },
    quit: { input: "q" },
} satisfies KbConfig;

export default function App(): React.ReactNode {
    return (
        <>
            <KeybindProcessingGate>
                <Keybinds config={kbs}>
                    <BroUpdater />
                    <InputTest />
                    <KbStateView />
                </Keybinds>
            </KeybindProcessingGate>
        </>
    );
}

let j = 0;
const InputTest = React.memo(function InputTest(): React.ReactNode {
    console.log(`INPUT: ${++j}`);
    const text = useFormInput();

    function isValidText(str: string) {
        return str === "no this is patrick";
    }

    function onSubmit() {
        if (isValidText(text.str)) {
            console.log("thanks for submitting your form bro");
        } else {
            console.log("buddy you have fucked up big time try again");
        }
    }

    return (
        <Box
            borderStyle="round"
            borderColor={isValidText(text.str) ? "green" : "red"}
        >
            <Input text={text} onSubmit={onSubmit} mask={false} />
        </Box>
    );
});

// let i = 0;
function BroUpdater(): React.ReactNode {
    // console.log(`BroUpdater: ${++i}`);

    const [bro, setBro] = useState("bro");
    const { exit } = useApp();

    const onCmd = useOnCmd<typeof kbs>();

    onCmd("bro", () => {
        setBro("bro");
    });

    onCmd("ctrlA", () => {
        setBro("ctrl a bro");
    });

    onCmd("quit", () => {
        exit();
    });

    return (
        <Box borderStyle="bold" borderColor="yellow">
            <Text>Bro Updater</Text>
            <Box borderStyle="round">
                <Text>{bro}</Text>
            </Box>
        </Box>
    );
}

// let k = 0;
function KbStateView(): React.ReactNode {
    // console.log(`kbstate: ${++k}`);
    return (
        <>
            <KbState>
                <Box width="90%" display="flex" justifyContent="space-between">
                    <Text>
                        Command: <KbState.Command />
                    </Text>
                    <Text>
                        Register: <KbState.Register />
                    </Text>
                </Box>
            </KbState>
        </>
    );
}

console.log("listening...\n");
