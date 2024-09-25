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
import { useForm } from "../Components/Form/useForm.js";

Register.setRegisterSize(2);

export default function App(): React.ReactNode {
    const { exit } = useApp();
    useKeybinds({ quit: { input: "q" } });
    useEvent("quit", () => exit());

    const { register, registerSubmit, handleSubmit, focus, errors } = useForm();
    const color = (name: string) => {
        if (focus[name]) return "blue";
        if (errors[name]) return "red";
        return "";
    };

    const errMsg = (name: string) => {
        const textBox = errors[name] && <Text color="red">{errors[name]}</Text>;
        return textBox || null;
    };

    return (
        <Box width={25} borderStyle="round">
            <Form onSubmit={handleSubmit((data) => console.log(data))}>
                <Box
                    width="100"
                    borderStyle="round"
                    borderColor={color("username")}
                    flexDirection="column"
                >
                    <TextInput
                        {...register("username", {
                            required: {
                                value: true,
                                message: "Missing username!",
                            },
                        })}
                        placeholder="Enter yo username"
                        enterBinding={{ input: "i" }}
                        exitBinding={{ key: "return" }}
                    />
                </Box>
                {errMsg("username")}
                <Box
                    width="100"
                    borderStyle="round"
                    borderColor={color("password")}
                    flexDirection="column"
                >
                    <TextInput
                        {...register("password", {
                            required: {
                                value: true,
                                message: "Missing pw!",
                            },
                        })}
                        placeholder="Enter yo password"
                        enterBinding={{ input: "i" }}
                        exitBinding={{ key: "return" }}
                        mask
                    />
                </Box>
                {errMsg("password")}

                <Box
                    width="100"
                    borderStyle="round"
                    borderColor={color("submit")}
                    flexDirection="column"
                >
                    <Submit
                        color={color("submit")}
                        {...registerSubmit("submit")}
                    >
                        Submit
                    </Submit>
                </Box>
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
    // const isFocus = useIsFocus();
    // const borderColor = isFocus ? "blue" : "";
    const borderColor = "";

    return (
        <Box borderStyle="round" borderColor={borderColor} width="100">
            <Submit color={borderColor}>Submit</Submit>
        </Box>
    );
}
