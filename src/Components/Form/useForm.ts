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

    const formStateRef = useRef<FormState>({});
    const focusCycleRef = useRef<string[]>([]);
    const focusRef = useRef<FocusState>({});

    const [focusIdx, setFocusIdx] = useState(0);
    const [errors, setErrors] = useState<Errors>({});
    const [_, forceRender] = useState(0);

    function updateFocusRef(nextIdx: number) {
        focusRef.current = Object.fromEntries(
            focusCycleRef.current.map((name, idx) => {
                return [name, nextIdx === idx];
            }),
        );
    }

    useKeybinds({
        focusNext: [{ key: "tab" }, { input: "j" }, { key: "down" }],
        focusPrev: [{ input: "k" }, { key: "up" }],
    });
    useEvent("focusNext", () => {
        if (focusIdx >= focusCycleRef.current.length - 1) {
            updateFocusRef(0); // why does the order matter here???
            setFocusIdx(0);
        } else {
            updateFocusRef(focusIdx + 1);
            setFocusIdx(focusIdx + 1);
        }
    });
    useEvent("focusPrev", () => {
        if (focusIdx === 0) {
            updateFocusRef(focusCycleRef.current.length - 1); // why does the order matter here???
            setFocusIdx(focusCycleRef.current.length - 1);
        } else {
            updateFocusRef(focusIdx - 1);
            setFocusIdx(focusIdx - 1);
        }
    });

    const register = createRegister({
        focus: focusRef.current,
        formState: formStateRef.current,
        focusCycle: focusCycleRef.current,
        submitCount: submitCount.current,
        errors,
        setErrors,
    });

    function registerSubmit(name: string) {
        if (!focusCycleRef.current.includes(name)) {
            focusCycleRef.current.push(name);
        }
        return { formFocus: focusRef.current[name] };
    }

    function handleSubmit(
        onSubmit: (data: FormValues) => void,
        onError?: (errors: Errors) => void,
    ): () => void {
        return () => {
            ++submitCount.current;

            const formValues = Object.fromEntries(
                Object.keys(formStateRef.current).map((name) => {
                    return [name, formStateRef.current[name].value];
                }),
            );

            let hasErrors = false;
            const nextErrors: Errors = {};
            Object.keys(formStateRef.current).forEach((k) => {
                const field = formStateRef.current[k];
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
        forceRender((prev) => prev + 1);
    }, []);

    return {
        register,
        registerSubmit,
        handleSubmit,
        errors,
        focus: focusRef.current,
    };
}
