import React, { useState } from "react";
import { Box, Text, useApp } from "ink";
import KeybindProcessingGate from "./keybinds/KeybindProcessingGate.js";
import KbState from "./KbState/KbState.js";
import Keybinds, { useOnCmd } from "./Keybinds/Keybinds.js";
import useKeybinds, { KbConfig } from "./keybinds/useKeybinds.js";
import Command from "./Command/Command.js";
import Input from "./Input/Input.js";
import { useFormInput } from "./Input/useFormInput.js";

const kbs = {
    bro: { input: "b" },
    ctrlA: { key: "ctrl", input: "a" },
    quit: { input: "q" },
} satisfies KbConfig;

export default function App(): React.ReactNode {
    return (
        <>
            <KeybindProcessingGate>
                <BroUpdater />
                <KbStateView />
                <InputTest />
                <Command />
            </KeybindProcessingGate>
        </>
    );
}

function InputTest(): React.ReactNode {
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
}

let i = 0;
function BroUpdater(): React.ReactNode {
    // console.log(`BroUpdater: ${++i}`);

    const [bro, setBro] = useState("bro");
    const { exit } = useApp();

    const { onCmd } = useKeybinds<typeof kbs>(kbs);

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

function KbStateView(): React.ReactNode {
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
