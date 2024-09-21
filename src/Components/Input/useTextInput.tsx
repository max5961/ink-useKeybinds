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
import { useItemFocus } from "../Sequence/SequenceUnit/ItemContext.js";
import { usePageFocus } from "../Sequence/SequenceUnit/PageContext.js";

export type InputState = {
    value: string;
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

export type UseFormReturn = {
    emitter: EventEmitter;
    clearText: () => void;
    setText: (newText: string) => void;
} & InputState;

export function useTextInput(opts?: Opts): UseFormReturn {
    const ACTIVE = opts?.active === undefined ? true : opts?.active;

    const [ID] = useState(randomUUID());
    const [emitter] = useState(new EventEmitter());

    const isItemFocus = useItemFocus();
    const isPageFocus = usePageFocus();

    const [state, setState] = useState<InputState>({
        value: opts?.defaultValue || "",
        idx: opts?.defaultValue?.length || 0,
        insert: (opts?.autoEnter && isPageFocus && isItemFocus) || false,
        stdin: null,
    });

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
            return { ...prev, stdin, insert: false, idx: prev.value.length };
        });
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

    useEvent(EVENTS.tab, () => {
        if (!state.insert) return;

        const nextStr = `${state.value}    `;

        setState({ ...state, idx: state.idx + 4, value: nextStr });
    });

    useEvent(EVENTS.backspace, () => {
        if (!state.insert) return;
        const { value, idx } = state;

        const nextIdx = idx > 0 ? idx - 1 : 0;
        const nextStr =
            value.slice(0, idx > 0 ? idx - 1 : 0) + value.slice(idx);

        setState({ ...state, value: nextStr, idx: nextIdx });
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

        let nextStringInput = state.value;

        if (state.insert) {
            nextStringInput = `${state.value.slice(0, state.idx)}${stdin}${state.value.slice(state.idx)}`;
        }

        const nextIdx = stdin ? state.idx + stdin.length : state.idx;

        if (nextIdx !== state.idx && state.insert) {
            setState({
                ...state,
                value: nextStringInput,
                idx: nextIdx,
            });
        }
    });

    function clearText(): void {
        setState((prev) => {
            return { ...prev, value: "", idx: 0 };
        });
    }

    function setText(newText: string): void {
        setState((prev) => {
            return { ...prev, value: newText, idx: newText.length };
        });
    }

    return { ...state, emitter, clearText, setText };
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
