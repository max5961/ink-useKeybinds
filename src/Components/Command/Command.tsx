import React from "react";
import { Text, Box } from "ink";
import Input from "../Input/Input.js";
import { useFormInput } from "../Input/useFormInput.js";

const commands = {
    bro: () => {
        console.log("bro command");
    },

    dude: () => {
        console.log("dude command");
    },
};

export default function Command(): React.ReactNode {
    const text = useFormInput({
        enter: { input: ":" },
        exit: [{ key: "esc" }, { key: "return" }],
    });

    function onSubmit() {
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
