import { useEffect, useRef, useState } from "react";
import { createRegister, RegisterOpts } from "./createRegister.js";
import { shallowEqualObjects } from "shallow-equal";
import { useNavigator } from "../Navigation/useNavigator.js";
import { mapIncludes } from "./util.js";

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
    util: {
        focusNext: () => void;
        focusPrev: () => void;
        focusUp: () => void;
        focusDown: () => void;
        focusRight: () => void;
        focusLeft: () => void;
        focusIteration: (n: number) => void;
    };
};

type Opts = {
    navigator?: string[][];
    keybinds?: "none" | "vi" | "arrow";
};

export function useForm(opts: Opts = {}): UseFormReturn {
    const submitCount = useRef(0);

    const formState = useRef<FormState>({});
    const [errors, setErrors] = useState<Errors>({});

    // could add a 'prev' here to check for changes in registers just in case
    // the form is ever changed and then setFocusMap again if there are any changes
    const focusMapRef = useRef<string[][]>([]);
    const [focusMap, setFocusMap] = useState<string[][]>([]);

    useEffect(() => {
        setFocusMap(focusMapRef.current);
    }, []);

    const { focus, util } = useNavigator(opts?.navigator || focusMap, {
        keybinds: opts?.keybinds || "arrow",
    });

    const register = createRegister({
        focus: focus,
        formState: formState.current,
        focusMapRef: focusMapRef.current,
        submitCount: submitCount.current,
        errors,
        setErrors,
    });

    function registerSubmit(name: string) {
        if (!mapIncludes(focusMapRef.current, name)) {
            focusMapRef.current.push([name]);
        }
        return { formFocus: focus[name] };
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

    return {
        register,
        registerSubmit,
        handleSubmit,
        errors,
        focus: focus,
        util: {
            focusUp: util.up,
            focusDown: util.down,
            focusLeft: util.left,
            focusRight: util.right,
            focusNext: util.next,
            focusPrev: util.prev,
            focusIteration: util.moveToIteration,
        },
    };
}
