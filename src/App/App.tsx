import React, { useState } from "react";
import { Box, Text, useApp } from "ink";
import KeybindProcessingGate from "../KeybindProcessingGate.js";
import KbState from "../Components/KbState/KbState.js";
import Input from "../Components/Input/Input.js";
import { useFormInput } from "../Components/Input/useFormInput.js";
import { KbConfig } from "../useKeybinds.js";
import Keybinds, { useOnCmd } from "../Keybinds.js";
import Command, { Commands } from "../Components/Command/Command.js";

const kbs = {
    foo: { input: "b" },
    ctrlA: { key: "ctrl", input: "a" },
    quit: { input: "q" },
} satisfies KbConfig;

const commands: Commands = {
    foo: () => {
        console.log("foo command");
    },
    bar: () => {
        console.log("bar command");
    },
};

export default function App(): React.ReactNode {
    return (
        <>
            <KeybindProcessingGate>
                <Keybinds config={kbs}>
                    <FooUpdater />
                    <InputTest />
                    <KbStateView />
                    <Command commands={commands} />
                </Keybinds>
            </KeybindProcessingGate>
        </>
    );
}

const InputTest = React.memo(function InputTest(): React.ReactNode {
    const text = useFormInput();

    function isValidText(str: string) {
        return str === "no this is patrick";
    }

    function onSubmit() {
        if (isValidText(text.str)) {
            console.log("thanks for submitting your form");
        } else {
            console.log("wrong passphrase try again");
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

function FooUpdater(): React.ReactNode {
    const [foo, setFoo] = useState("foo");
    const { exit } = useApp();

    const onCmd = useOnCmd<typeof kbs>();

    onCmd("foo", () => {
        setFoo("foo");
    });

    onCmd("ctrlA", () => {
        setFoo("ctrl a foo");
    });

    onCmd("quit", () => {
        exit();
    });

    return (
        <Box borderStyle="bold" borderColor="yellow">
            <Text>Bro Updater</Text>
            <Box borderStyle="round">
                <Text>{foo}</Text>
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
