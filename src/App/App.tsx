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
import { useNavigator } from "../Components/Navigation/useNavigator.js";

Register.setRegisterSize(2);

// prettier-ignore
const navigatorOne = [
    ["A", "B"],
    ["C", "D"],
    ["E"],
    ["F", "G"]
];

// prettier-ignore
const navigatorTwo = [
    ["A", "B"],
    ["C", "D"],
    ["E"],
    ["F", "G"],
    ["H"],
    ["I"],
    ["J"],
    ["K"],
]

// prettier-ignore
type Nav = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";

export default function App(): React.ReactNode {
    const { exit } = useApp();
    useKeybinds({ quit: { input: "q" } });
    useEvent("quit", () => exit());

    const [navOne, setNavOne] = useState(true);

    // prettier-ignore
    const { node, focus } = useNavigator<Nav>(navOne ? navigatorOne : navigatorTwo, {
        keybinds: "vi",
    });

    useKeybinds({ toggleNav: { key: "f5" } });

    useEvent("toggleNav", () => {
        setNavOne(!navOne);
    });

    const color = (node: Nav) => (focus[node] ? "blue" : "");

    if (navOne) {
        return (
            <Box width={50} flexDirection="column" borderStyle="round">
                <Box flexDirection="row">
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("A")}
                    >
                        <Text>Box A</Text>
                    </Box>
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("B")}
                    >
                        <Text>Box B</Text>
                    </Box>
                </Box>
                <Box flexDirection="row">
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("C")}
                    >
                        <Text>Box C</Text>
                    </Box>
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("D")}
                    >
                        <Text>Box D</Text>
                    </Box>
                </Box>
                <Box flexDirection="row">
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("E")}
                    >
                        <Text>Box E</Text>
                    </Box>
                </Box>
                <Box flexDirection="row">
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("F")}
                    >
                        <Text>Box F</Text>
                    </Box>
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("G")}
                    >
                        <Text>Box G</Text>
                    </Box>
                </Box>
            </Box>
        );
    } else {
        return (
            <Box width={50} flexDirection="column" borderStyle="round">
                <Box flexDirection="row">
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("A")}
                    >
                        <Text>Box A</Text>
                    </Box>
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("B")}
                    >
                        <Text>Box B</Text>
                    </Box>
                </Box>
                <Box flexDirection="row">
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("C")}
                    >
                        <Text>Box C</Text>
                    </Box>
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("D")}
                    >
                        <Text>Box D</Text>
                    </Box>
                </Box>
                <Box flexDirection="row">
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("E")}
                    >
                        <Text>Box E</Text>
                    </Box>
                </Box>
                <Box flexDirection="row">
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("F")}
                    >
                        <Text>Box F</Text>
                    </Box>
                    <Box
                        borderStyle="round"
                        width="50"
                        borderColor={color("G")}
                    >
                        <Text>Box G</Text>
                    </Box>
                </Box>
                <Box borderStyle="round" width="50" borderColor={color("H")}>
                    <Text>Box H</Text>
                </Box>
                <Box borderStyle="round" width="50" borderColor={color("I")}>
                    <Text>Box I</Text>
                </Box>
                <Box borderStyle="round" width="50" borderColor={color("J")}>
                    <Text>Box J</Text>
                </Box>
                <Box borderStyle="round" width="50" borderColor={color("K")}>
                    <Text>Box K</Text>
                </Box>
            </Box>
        );
    }
}

// export default function App(): React.ReactNode {
//     const { exit } = useApp();
//     useKeybinds({ quit: { input: "q" } });
//     useEvent("quit", () => exit());
//
//     const { register, registerSubmit, handleSubmit, focus, errors } = useForm();
//     const color = (name: string) => {
//         if (focus[name]) return "blue";
//         // if (errors[name]) return "red";
//         return "";
//     };
//
//     const errMsg = (name: string) => {
//         // This should be errors[name]?.message
//         return <Text color="red">{errors[name]}</Text>;
//     };
//
//     function onSubmit(data) {
//         console.log("Form submitted!");
//         console.log(data);
//     }
//
//     function onError(errors) {
//         console.log("You have submitted the form with errors!");
//         console.log("Here are the errors you need to fix");
//         console.log(errors);
//     }
//
//     function roundBorder() {
//         return {
//             width: "100",
//             borderStyle: "round",
//             alignItems: "center",
//             justifyContent: "center",
//         } as const;
//     }
//
//     return (
//         <Box {...roundBorder()}>
//             <Box width={25} borderStyle="round">
//                 <Form onSubmit={handleSubmit(onSubmit, onError)}>
//                     <Box
//                         width="100"
//                         borderStyle="round"
//                         borderColor={color("username")}
//                         flexDirection="column"
//                     >
//                         <TextInput
//                             {...register("username", {
//                                 required: {
//                                     value: true,
//                                     message: "Missing username!",
//                                 },
//                             })}
//                             placeholder="Enter yo username"
//                             enterBinding={{ input: "i" }}
//                             exitBinding={{ key: "return" }}
//                         />
//                     </Box>
//                     {errMsg("username")}
//                     <Box
//                         width="100"
//                         borderStyle="round"
//                         borderColor={color("password")}
//                         flexDirection="column"
//                     >
//                         <TextInput
//                             {...register("password", {
//                                 required: {
//                                     value: true,
//                                     message: "Missing pw!",
//                                 },
//                             })}
//                             placeholder="Enter yo password"
//                             enterBinding={{ input: "i" }}
//                             exitBinding={{ key: "return" }}
//                             mask
//                         />
//                     </Box>
//                     {errMsg("password")}
//
//                     <Box
//                         width="100"
//                         borderStyle="round"
//                         borderColor={color("submit")}
//                         flexDirection="column"
//                     >
//                         <Submit
//                             color={color("submit")}
//                             {...registerSubmit("submit")}
//                         >
//                             Submit
//                         </Submit>
//                     </Box>
//                 </Form>
//             </Box>
//         </Box>
//     );
// }
//
// function MyInput({ name }: { name: string }): React.ReactNode {
//     const [value, onChange] = useState("");
//
//     const isFocus = useIsFocus();
//     const borderColor = isFocus ? "blue" : "";
//
//     return (
//         <Box borderStyle="round" borderColor={borderColor} width="100">
//             <TextInput
//                 name={name}
//                 value={value}
//                 onChange={onChange}
//                 autoEnter={true}
//                 enterBinding={{ input: "i" }}
//                 exitBinding={{ key: "return" }}
//                 placeholder={
//                     name === "username"
//                         ? "Enter your username"
//                         : "Enter your password"
//                 }
//                 mask={name === "password"}
//             />
//         </Box>
//     );
// }
//
// function SubmitButton(): React.ReactNode {
//     // const isFocus = useIsFocus();
//     // const borderColor = isFocus ? "blue" : "";
//     const borderColor = "";
//
//     return (
//         <Box borderStyle="round" borderColor={borderColor} width="100">
//             <Submit color={borderColor}>Submit</Submit>
//         </Box>
//     );
// }
