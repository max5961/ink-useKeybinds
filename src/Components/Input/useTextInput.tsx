import { useEffect, useRef, useState } from "react";
import { useKeybinds, KeyBinds } from "../../use-keybinds/useKeybinds.js";
import { KEYCODES } from "../../use-keybinds/Keycodes.js";
import { randomUUID } from "crypto";
import { useEvent } from "../../use-keybinds/useEvent.js";
import FormKeys, { EVENTS } from "./FormKeys.js";
import { Priority } from "../../use-keybinds/ProcessingGate.js";
import { useIsFocus } from "../Sequence/SequenceUnit/useIsFocus.js";
import { TextInputTypes } from "./TextInput.js";
import { useFormContext } from "../Form/Form.js";

type State = {
    value: string;
    idx: number;
    insert: boolean;
    stdin: string | null;
};

type Args = TextInputTypes.Props;

export type Return = Omit<State, "value"> & { nextValue: string };

export function useTextInput(args: Args): Return {
    const formContext = useFormContext();

    function updateFormValues(nextValue: string) {
        if (!formContext || !args.name) return;

        formContext.values[args.name] = nextValue;
    }

    const ACTIVE = args?.active === undefined ? true : args?.active;
    const [ID] = useState(randomUUID());

    const isFocus =
        useIsFocus() && (args.formFocus === undefined || args.formFocus);

    const formFocus = args.formFocus === undefined || args.formFocus;

    // console.log(`name: ${args.name}, isFocus: ${isFocus}`);

    // value also needs to be defined here as well to account for onChange changing value
    // rather than relying on the local state.value variable

    const [state, setState] = useState<State>({
        value: args.value,
        idx: args.value.length,
        insert: (args.autoEnter && isFocus) || false,
        stdin: null,
    });

    useEffect(() => {
        if (!isFocus) return;

        if (args?.autoEnter && !state.insert) {
            setState({ ...state, insert: true });
            args.onEnter && args.onEnter(state.stdin || "");
        }
    }, [isFocus]);

    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            if (!state.insert) return;
        }

        if (state.insert) {
            args.onEnter && args.onEnter(state.stdin || "");
        } else {
            args.onExit && args.onExit(state.stdin || "");
        }
    }, [state.insert]);

    const [normalKb, ENTER] = FormKeys.getNormalKeybindings(
        ID,
        args.enterBinding,
    );
    const [insertKb, EXIT] = FormKeys.getInsertKeybindings(
        ID,
        args.exitBinding,
    );

    const keybinds: KeyBinds = state.insert ? insertKb : normalKb;
    const priority: Priority =
        state.insert && isFocus ? "textinput" : isFocus ? "default" : "never";

    useKeybinds(keybinds, { priority });

    useEvent(
        ENTER,
        (stdin: string) => {
            setState((prev) => {
                return { ...prev, stdin, insert: true };
            });
            args.onEnter && args.onEnter(stdin);
        },
        formFocus,
    );

    useEvent(
        EXIT,
        (stdin: string) => {
            setState((prev) => {
                return {
                    ...prev,
                    stdin,
                    insert: false,
                    idx: prev.value.length,
                };
            });
            args.onExit && args.onExit(stdin);
        },
        formFocus,
    );

    useEvent(
        EVENTS.left,
        () => {
            if (state.insert && state.idx > 0) {
                setState({ ...state, idx: state.idx - 1 });
            }
        },
        formFocus,
    );

    useEvent(
        EVENTS.right,
        () => {
            if (!isFocus) return;
            if (state.insert && state.idx < state.value.length) {
                setState({ ...state, idx: state.idx + 1 });
            }
        },
        formFocus,
    );

    // can pass off form control here
    useEvent(
        EVENTS.tab,
        () => {
            if (state.insert && args.insertControl?.tab) {
                args.insertControl.tab();
                setState({ ...state, insert: false });
            }
        },
        formFocus,
    );

    useEvent(
        EVENTS.down,
        () => {
            if (!state.insert || !formContext) return;
            args.insertControl?.down && args.insertControl.down();
            setState({ ...state, insert: false });
        },
        formFocus,
    );

    useEvent(
        EVENTS.up,
        () => {
            if (!state.insert || !formContext) return;
            args.insertControl?.up && args.insertControl.up();
            setState({ ...state, insert: false });
        },
        formFocus,
    );

    // CAN UPDATE VALUE
    useEvent(
        EVENTS.backspace,
        () => {
            if (!state.insert) return;
            let { value, idx } = state;

            // if (useFormRef && props.name) {
            //     value = ref[name].current];
            // }

            const nextIdx = idx > 0 ? idx - 1 : 0;
            const nextValue =
                value.slice(0, idx > 0 ? idx - 1 : 0) + value.slice(idx);

            updateFormValues(nextValue);
            setState({ ...state, value: nextValue, idx: nextIdx });
        },
        formFocus,
    );

    // CAN UPDATE VALUE
    useEvent(
        EVENTS.keypress,
        (stdin: string) => {
            if (state.insert) {
                args.onKeypress && args.onKeypress(stdin);
            }

            const invalidChars = [
                KEYCODES.esc,
                KEYCODES.insert,
                KEYCODES.return,
            ];
            for (const invalidChar of invalidChars) {
                if (invalidChar === stdin) {
                    return;
                }
            }

            let nextValue = state.value;

            if (state.insert) {
                nextValue = `${state.value.slice(0, state.idx)}${stdin}${state.value.slice(state.idx)}`;
            }

            const nextIdx = stdin ? state.idx + stdin.length : state.idx;

            if (nextIdx !== state.idx && state.insert) {
                updateFormValues(nextValue);
                setState({
                    ...state,
                    value: nextValue,
                    idx: nextIdx,
                });
            }
        },
        formFocus,
    );

    return {
        nextValue: state.value,
        idx: state.idx,
        insert: state.insert,
        stdin: state.stdin,
    };
}

// insert.useEvent("returnKey", () => {
//     if (!state.insert) return;
//
//     if (state.value.match(/\n {4}[\w\s]+$/gm)) {
//         setState({
//             ...state,
//             value: `${state.value}\n    `,
//             idx: state.idx + 5,
//         });
//     } else {
//         setState({ ...state, idx: state.idx + 1, value: `${state.value}\n` });
//     }
// });
