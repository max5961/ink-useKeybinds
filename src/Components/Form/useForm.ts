// import { useRef, useState } from "react";
// import EventEmitter from "events";
// import { Return } from "../Input/useTextInput.js";
//
// type FormState = {
//     [key: string]: { text: string };
// };
//
// type UseFormReturn = {
//     register: (name: string) => {
//         name: string;
//         inputState: Return["inputState"];
//     };
//     handleSubmit: (onSubmit: (data: FormState) => unknown) => () => void;
// };
//
// export function useForm() {
//     const [FORM_EMITTER] = useState(new EventEmitter());
//     const formState = useRef<FormState>({});
//
//     function register(name: string): ReturnType<UseFormReturn["register"]> {
//         if (!formState.current[name]) {
//             formState.current[name] = { text: "" };
//
//             FORM_EMITTER.on(name, (text: string) => {
//                 formState.current[name].text = text;
//             });
//         }
//
//         // There isn't a need to actually inject the formState ref into
//         // the component being registered.  What this is really doing is
//         // allowing the FORM_EMITTER object to make its way to the form
//         // component without disrupting the normal functioning of the component
//         const inputState: Return["inputState"] = {
//             emitter: FORM_EMITTER,
//             text: "",
//             stdin: "",
//             insert: false,
//             idx: 0,
//         };
//
//         return { name, inputState };
//     }
//
//     function handleSubmit(onSubmit: (data: FormState) => void): () => void {
//         return () => {
//             onSubmit(formState.current);
//         };
//     }
//
//     return { register, handleSubmit };
// }
