import React from "react";
import { Text, Box } from "ink";
import { Input } from "../Input/Input.js";
import { useFormInput } from "../Input/useFormInput.js";
import { HEX_MAP } from "src/use-keybinds/HexMap.js";

type Props = {
    commands: Commands;
};

export type Commands = { [commandName: string]: () => unknown };

export function Command({ commands }: Props): React.ReactNode {
    const text = useFormInput({
        enter: { input: ":" },
        exit: [{ key: "esc" }, { key: "return" }],
    });

    function onSubmit(stdin: string) {
        if (stdin === HEX_MAP.esc) {
            return text.clearText();
        }

        if (commands[text.str]) {
            commands[text.str]();
        } else {
            text.setText(`command not found: ${text.str}`);
        }
    }

    function onEnter() {
        text.clearText();
    }

    return (
        <Box display="flex">
            <Text>{text.insert || text.str.length ? ":" : ""}</Text>
            <Input text={text} onSubmit={onSubmit} onEnter={onEnter} />
        </Box>
    );
}
