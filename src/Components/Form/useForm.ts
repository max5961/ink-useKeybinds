import { useEffect, useRef, useState } from "react";
import { useKeybinds } from "../../use-keybinds/useKeybinds.js";
import { useEvent } from "../../use-keybinds/useEvent.js";
import { createRegister, RegisterOpts } from "./createRegister.js";
import { shallowEqualObjects } from "shallow-equal";

export type FormState = {
    [key: string]: { value: string; opts: RegisterOpts; error: string };
};

export type FormValues = {
    [name: string]: string;
};

export type FocusState = {
    [name: string]: boolean;
};

export type FocusCycle = string[];

export type Errors = {
    [name: string]: null | string;
};

export type UseFormReturn = {
    register: (
        name: string,
        opts?: RegisterOpts,
    ) => {
        name: string;
        value: string;
        onChange: (nextValue: string) => void;
        formFocus: boolean;
    };
    registerSubmit: (name: string) => { formFocus: boolean };
    handleSubmit: (
        onSubmit: (data: FormValues) => unknown,
        onError?: (errors: Errors) => void,
    ) => () => void;
    focus: FocusState;
    errors: Errors;
};

export function useForm(): UseFormReturn {
    const submitCount = useRef(0);

    const formState = useRef<FormState>({});
    const focusArray = useRef<string[]>([]);
    const focus = useRef<FocusState>({});

    const [focusIdx, setFocusIdx] = useState(0);
    const [errors, setErrors] = useState<Errors>({});
    const [_, render] = useState(0);
    const forceRender = () => render((prev) => prev + 1);

    function updateFocusRef(nextIdx: number) {
        focus.current = Object.fromEntries(
            focusArray.current.map((name, idx) => {
                return [name, nextIdx === idx];
            }),
        );
    }

    useKeybinds({
        focusNext: [{ key: "tab" }, { input: "j" }, { key: "down" }],
        focusPrev: [{ input: "k" }, { key: "up" }],
    });
    useEvent("focusNext", () => {
        if (focusIdx >= focusArray.current.length - 1) {
            updateFocusRef(0); // why does the order matter here???
            setFocusIdx(0);
        } else {
            updateFocusRef(focusIdx + 1);
            setFocusIdx(focusIdx + 1);
        }
    });
    useEvent("focusPrev", () => {
        if (focusIdx === 0) {
            updateFocusRef(focusArray.current.length - 1); // why does the order matter here???
            setFocusIdx(focusArray.current.length - 1);
        } else {
            updateFocusRef(focusIdx - 1);
            setFocusIdx(focusIdx - 1);
        }
    });

    const register = createRegister({
        focus: focus.current,
        formState: formState.current,
        focusArray: focusArray.current,
        submitCount: submitCount.current,
        errors,
        setErrors,
    });

    function registerSubmit(name: string) {
        if (!focusArray.current.includes(name)) {
            focusArray.current.push(name);
        }
        return { formFocus: focus.current[name] };
    }

    function handleSubmit(
        onSubmit: (data: FormValues) => void,
        onError?: (errors: Errors) => void,
    ): () => void {
        return () => {
            ++submitCount.current;

            const formValues = Object.fromEntries(
                Object.keys(formState.current).map((name) => {
                    return [name, formState.current[name].value];
                }),
            );

            let hasErrors = false;
            const nextErrors: Errors = {};
            Object.keys(formState.current).forEach((k) => {
                const field = formState.current[k];
                nextErrors[k] = null;
                if (field.opts.required && field.value === "") {
                    nextErrors[k] = field.opts.required.message;
                    hasErrors = true;
                }
            });

            if (!shallowEqualObjects(nextErrors, errors)) {
                setErrors(nextErrors);
            }

            if (hasErrors && onError) {
                onError(nextErrors);
            } else {
                onSubmit(formValues);
            }
        };
    }

    useEffect(() => {
        updateFocusRef(focusIdx);
        forceRender();
    }, []);

    return {
        register,
        registerSubmit,
        handleSubmit,
        errors,
        focus: focus.current,
    };
}
