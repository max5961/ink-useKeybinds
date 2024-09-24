import React, { PropsWithChildren, useState } from "react";
import { initialItems, Item } from "./initialData.js";
import { Box, Text, useApp } from "ink";
import Register from "../use-keybinds/Register.js";
import { Form } from "../Components/Form/Form.js";
import { TextInput } from "../Components/Input/TextInput.js";
import { useIsFocus } from "../Components/Sequence/SequenceUnit/useIsFocus.js";
import { Submit } from "../Components/Form/Submit.js";
import { useKeybinds } from "../use-keybinds/useKeybinds.js";
import { useEvent } from "../use-keybinds/useEvent.js";

Register.setRegisterSize(2);

export default function App(): React.ReactNode {
    const { exit } = useApp();
    useKeybinds({ quit: { input: "q" } });
    useEvent("quit", () => exit());

    /*
     * Create wrapper for TextInput that automatically calls useTextInput and
     * passes it to TextInput.  It also creates a Context that allows to pass in
     * the emitter from useTextInput directly as a prop and then get the Context
     * from the wrapper for TextInput to pass in the FORM_EMITTER object.  On
     * every render for TextInput, if there is context, then FORM_EMITTER will
     * emit an event that sends data UP to the useForm hook to update it's ref and
     * subsequently perform any checks on the new data and updating state accordingly
     * such as updating the errors object state that should be returned from the
     * hook
     * */

    return (
        <Box width={25} borderStyle="round">
            <Form
                onSubmit={(data) => {
                    console.log(data);
                }}
            >
                <MyInput name="username" />
                <MyInput name="password" />
                <SubmitButton />
            </Form>
        </Box>
    );
}

function MyInput({ name }: { name: string }): React.ReactNode {
    const [value, onChange] = useState("");

    const isFocus = useIsFocus();
    const borderColor = isFocus ? "blue" : "";

    return (
        <Box borderStyle="round" borderColor={borderColor} width="100">
            <TextInput
                name={name}
                value={value}
                onChange={onChange}
                autoEnter={true}
                enterBinding={{ input: "i" }}
                exitBinding={{ key: "return" }}
                placeholder={
                    name === "username"
                        ? "Enter your username"
                        : "Enter your password"
                }
                mask={name === "password"}
            />
        </Box>
    );
}

function SubmitButton(): React.ReactNode {
    const isFocus = useIsFocus();
    const borderColor = isFocus ? "blue" : "";

    return (
        <Box borderStyle="round" borderColor={borderColor} width="100">
            <Submit color={borderColor}>Submit</Submit>
        </Box>
    );
}
