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

    // prettier-ignore
    const AUTO_INSERT = formContext && args.autoInsert === undefined ? true : args.autoInsert;
    const IS_FOCUS = useIsFocus() && (args.nameFocused === undefined || args.nameFocused);
    const [ID] = useState(randomUUID());

    function updateFormValues(nextValue: string) {
        if (!formContext || !args.name) return;

        formContext.values[args.name] = nextValue;
    }

    // Value also needs to be defined here as well to account for onChange changing value
    // rather than relying on the local state.value variable
    const [state, setState] = useState<State>({
        value: args.value,
        idx: args.value.length,
        insert: (AUTO_INSERT && IS_FOCUS) || false,
        stdin: null,
    });

    // Handle automatically entering insert if when entering focus
    useEffect(() => {
        if (!IS_FOCUS) return;

        if (AUTO_INSERT && !state.insert) {
            setState({ ...state, insert: true });
            args.onEnter && args.onEnter(state.stdin || "");
        }
    }, [IS_FOCUS]);

    // Handle executing onEnter and onExit callbacks
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

    /*
     * Handle keypresses that control state
     *
     * left, right, up, down, tab, enter, exit can only effect display value
     * keypress, backspace can effect both stored value and displayed, so they must
     * also update the formState ref in the useForm hook
     */
    const [normalKb, ENTER] = FormKeys.getNormalKeybindings(ID, args.enterBinding);
    const [insertKb, EXIT] = FormKeys.getInsertKeybindings(ID, args.exitBinding);
    const keybinds: KeyBinds = state.insert ? insertKb : normalKb;
    const priority: Priority =
        state.insert && IS_FOCUS ? "textinput" : IS_FOCUS ? "default" : "never";

    useKeybinds(keybinds, { priority });

    useEvent(
        ENTER,
        (stdin: string) => {
            setState((prev) => {
                return { ...prev, stdin, insert: true };
            });
            args.onEnter && args.onEnter(stdin);
        },
        IS_FOCUS,
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
        IS_FOCUS,
    );

    useEvent(
        EVENTS.left,
        () => {
            if (state.insert && state.idx > 0) {
                setState({ ...state, idx: state.idx - 1 });
            }
        },
        IS_FOCUS,
    );

    useEvent(
        EVENTS.right,
        () => {
            if (state.insert && state.idx < state.value.length) {
                setState({ ...state, idx: state.idx + 1 });
            }
        },
        IS_FOCUS,
    );

    useEvent(
        EVENTS.tab,
        () => {
            if (!state.insert || !args.insertControl?.tab) return;

            const success = args.insertControl.tab();
            if (typeof success === "boolean" && success) {
                setState({ ...state, insert: false });
            }
        },
        IS_FOCUS,
    );

    useEvent(
        EVENTS.down,
        () => {
            if (!state.insert || !args.insertControl?.down) return;

            const success = args.insertControl.down();
            if (typeof success === "boolean" && success) {
                setState({ ...state, insert: false });
            }
        },
        IS_FOCUS,
    );

    useEvent(
        EVENTS.up,
        () => {
            if (!state.insert || !args.insertControl?.up) return;

            const success = args.insertControl.up();
            if (typeof success === "boolean" && success) {
                setState({ ...state, insert: false });
            }
        },
        IS_FOCUS,
    );

    useEvent(
        EVENTS.backspace,
        () => {
            if (!state.insert) return;
            let { value, idx } = state;

            const nextIdx = idx > 0 ? idx - 1 : 0;
            const nextValue = value.slice(0, idx > 0 ? idx - 1 : 0) + value.slice(idx);

            updateFormValues(nextValue);
            setState({ ...state, value: nextValue, idx: nextIdx });
        },
        IS_FOCUS,
    );

    useEvent(
        EVENTS.keypress,
        (stdin: string) => {
            if (state.insert) {
                args.onKeypress && args.onKeypress(stdin);
            }

            const invalidChars = [KEYCODES.esc, KEYCODES.insert, KEYCODES.return];
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
        IS_FOCUS,
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
