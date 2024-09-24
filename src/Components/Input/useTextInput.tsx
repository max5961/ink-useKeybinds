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

    const isFocus = useIsFocus();
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
    // prettier-ignore
    const priority: Priority = state.insert ? "textinput" : ACTIVE ? "default" : "never";

    useKeybinds(keybinds, { priority });

    useEvent(ENTER, (stdin: string) => {
        setState((prev) => {
            return { ...prev, stdin, insert: true };
        });
        args.onEnter && args.onEnter(stdin);
    });

    useEvent(EXIT, (stdin: string) => {
        setState((prev) => {
            return { ...prev, stdin, insert: false, idx: prev.value.length };
        });
        args.onExit && args.onExit(stdin);
    });

    useEvent(EVENTS.left, () => {
        if (state.insert && state.idx > 0) {
            setState({ ...state, idx: state.idx - 1 });
        }
    });

    useEvent(EVENTS.right, () => {
        if (state.insert && state.idx < state.value.length) {
            setState({ ...state, idx: state.idx + 1 });
        }
    });

    // can pass off form control here
    useEvent(EVENTS.tab, () => {
        if (!state.insert) return;

        if (formContext) {
            setState({ ...state, insert: false });
            formContext.nextItem();
        } else {
            const nextValue = `${state.value}    `;
            updateFormValues(nextValue);
            setState({ ...state, idx: state.idx + 4, value: nextValue });
        }
    });

    useEvent(EVENTS.down, () => {
        if (!state.insert || !formContext) return;
        setState({ ...state, insert: false });
        formContext.nextItem();
    });

    useEvent(EVENTS.up, () => {
        if (!state.insert || !formContext) return;
        setState({ ...state, insert: false });
        formContext.prevItem();
    });

    useEvent(EVENTS.backspace, () => {
        if (!state.insert) return;
        const { value, idx } = state;

        const nextIdx = idx > 0 ? idx - 1 : 0;
        const nextValue =
            value.slice(0, idx > 0 ? idx - 1 : 0) + value.slice(idx);

        updateFormValues(nextValue);
        setState({ ...state, value: nextValue, idx: nextIdx });
    });

    useEvent(EVENTS.keypress, (stdin: string) => {
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
    });

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
