import { useEffect, useRef, useState } from "react";
import {
    useKeybinds,
    Binding,
    KeyBinds,
} from "../../use-keybinds/useKeybinds.js";
import { KEYCODES } from "../../use-keybinds/Keycodes.js";
import { randomUUID } from "crypto";
import EventEmitter from "events";
import { useEvent } from "../../use-keybinds/useEvent.js";
import FormKeys, { EVENTS } from "./FormKeys.js";
import { Priority } from "../../use-keybinds/ProcessingGate.js";
import { useIsFocus } from "../Sequence/SequenceUnit/useIsFocus.js";

type State = {
    text: string;
    idx: number;
    insert: boolean;
    stdin: string | null;
};

type Opts = {
    enter?: Binding | Binding[];
    exit?: Binding | Binding[];
    defaultValue?: string;
    active?: boolean;
    autoEnter?: boolean;
};

export type Return = {
    text: string;
    clearText: () => void;
    setText: (newText: string) => void;
    inputState: State & { emitter: EventEmitter };
};

export function useTextInput(opts?: Opts): Return {
    const ACTIVE = opts?.active === undefined ? true : opts?.active;

    const [ID] = useState(randomUUID());
    const [emitter] = useState(new EventEmitter());

    const isFocus = useIsFocus();

    const [state, setState] = useState<State>({
        text: opts?.defaultValue || "",
        idx: opts?.defaultValue?.length || 0,
        insert: (opts?.autoEnter && isFocus) || false,
        stdin: null,
    });

    useEffect(() => {
        if (!isFocus) return;

        if (opts?.autoEnter && !state.insert) {
            setState({ ...state, insert: true });
            emitter.emit("enter", state.stdin);
        }
    }, [isFocus]);

    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            if (!state.insert) return;
        }

        if (state.insert) {
            emitter.emit("enter", state.stdin);
        } else {
            emitter.emit("submit", state.stdin);
        }
    }, [state.insert]);

    const [normalKb, ENTER] = FormKeys.getNormalKeybindings(ID, opts?.enter);
    const [insertKb, EXIT] = FormKeys.getInsertKeybindings(ID, opts?.exit);

    const keybinds: KeyBinds = state.insert ? insertKb : normalKb;
    // prettier-ignore
    const priority: Priority = state.insert ? "textinput" : ACTIVE ? "default" : "never";

    useKeybinds(keybinds, { priority });

    useEvent(ENTER, (stdin: string) => {
        setState((prev) => {
            return { ...prev, stdin, insert: true };
        });
    });

    useEvent(EXIT, (stdin: string) => {
        setState((prev) => {
            return { ...prev, stdin, insert: false, idx: prev.text.length };
        });
    });

    useEvent(EVENTS.left, () => {
        if (state.insert && state.idx > 0) {
            setState({ ...state, idx: state.idx - 1 });
        }
    });

    useEvent(EVENTS.right, () => {
        if (state.insert && state.idx < state.text.length) {
            setState({ ...state, idx: state.idx + 1 });
        }
    });

    useEvent(EVENTS.tab, () => {
        if (!state.insert) return;

        const nextStr = `${state.text}    `;

        setState({ ...state, idx: state.idx + 4, text: nextStr });
    });

    useEvent(EVENTS.backspace, () => {
        if (!state.insert) return;
        const { text, idx } = state;

        const nextIdx = idx > 0 ? idx - 1 : 0;
        const nextStr = text.slice(0, idx > 0 ? idx - 1 : 0) + text.slice(idx);

        setState({ ...state, text: nextStr, idx: nextIdx });
    });

    useEvent(EVENTS.keypress, (stdin: string) => {
        if (state.insert) {
            emitter.emit("keypress", stdin);
        }

        const invalidChars = [KEYCODES.esc, KEYCODES.insert, KEYCODES.return];
        for (const invalidChar of invalidChars) {
            if (invalidChar === stdin) {
                return;
            }
        }

        let nextStringInput = state.text;

        if (state.insert) {
            nextStringInput = `${state.text.slice(0, state.idx)}${stdin}${state.text.slice(state.idx)}`;
        }

        const nextIdx = stdin ? state.idx + stdin.length : state.idx;

        if (nextIdx !== state.idx && state.insert) {
            setState({
                ...state,
                text: nextStringInput,
                idx: nextIdx,
            });
        }
    });

    function clearText(): void {
        setState((prev) => {
            return { ...prev, text: "", idx: 0 };
        });
    }

    function setText(newText: string): void {
        setState((prev) => {
            return { ...prev, text: newText, idx: newText.length };
        });
    }

    return {
        text: state.text,
        inputState: { ...state, emitter },
        clearText,
        setText,
    };
}

// insert.useEvent("returnKey", () => {
//     if (!state.insert) return;
//
//     if (state.text.match(/\n {4}[\w\s]+$/gm)) {
//         setState({
//             ...state,
//             text: `${state.text}\n    `,
//             idx: state.idx + 5,
//         });
//     } else {
//         setState({ ...state, idx: state.idx + 1, text: `${state.text}\n` });
//     }
// });
