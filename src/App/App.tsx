import React, { useState } from "react";
import { Box, Text, useApp } from "ink";
import { StdinState } from "../Components/StdinState/StdinState.js";
import { Input } from "../Components/Input/Input.js";
import { useFormInput } from "../Components/Input/useFormInput.js";
import { KeyBinds } from "src/use-keybinds/useKeybinds.js";
import {
    KeybindsProvider,
    useOnEvent,
} from "src/use-keybinds/KeybindsProvider.js";
import { Command, Commands } from "../Components/Command/Command.js";

const kbs = {
    foo: { input: "b" },
    ctrlA: { key: "ctrl", input: "a" },
    quit: { input: "q" },
} satisfies KeyBinds;

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
            <KeybindsProvider config={kbs}>
                <FooUpdater />
                <InputTest />
                <KbStateView />
                <Command commands={commands} />
            </KeybindsProvider>
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

    const onEvent = useOnEvent<typeof kbs>();

    onEvent("foo", () => {
        setFoo("foo");
    });

    onEvent("ctrlA", () => {
        setFoo("ctrl a foo");
    });

    onEvent("quit", () => {
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
            <StdinState>
                <Box width="90%" display="flex" justifyContent="space-between">
                    <Text>
                        Command: <StdinState.Event />
                    </Text>
                    <Text>
                        Register: <StdinState.Register />
                    </Text>
                </Box>
            </StdinState>
        </>
    );
}

console.log("listening...\n");
