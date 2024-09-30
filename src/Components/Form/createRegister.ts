import { shallowEqualObjects } from "shallow-equal";
import { FocusState, FormState, UseFormReturn, Errors } from "./useForm.js";

import { mapIncludes } from "./util.js";

export type RegisterOpts = {
    required?: {
        value: boolean;
        message: string;
    };
};

export function createRegister({
    formState,
    focusMapRef,
    focus,
    submitCount,
    errors,
    setErrors,
}: {
    formState: FormState;
    focusMapRef: string[][];
    focus: FocusState;
    submitCount: number;
    errors: Errors;
    setErrors: (errors: Errors) => void;
}) {
    return (
        name: string,
        opts?: RegisterOpts,
    ): ReturnType<UseFormReturn["register"]> => {
        if (formState[name] === undefined) {
            formState[name] = { value: "", opts: opts ?? {}, error: "" };
        }

        if (!mapIncludes(focusMapRef, name)) focusMapRef.push([name]);

        function onChange(nextValue: string) {
            formState[name].value = nextValue;

            // Don't opts until after first submit
            if (!submitCount) return;

            // this is just copy and pasted form useForm onSubmit for now
            const nextErrors: Errors = {};
            Object.keys(formState).forEach((k) => {
                const field = formState[k];
                nextErrors[k] = null;
                if (field.opts.required && field.value === "") {
                    nextErrors[k] = field.opts.required.message;
                }
            });

            if (!shallowEqualObjects(nextErrors, errors)) {
                setErrors(nextErrors);
            }
        }

        return {
            name: name,
            value: formState[name].value,
            onChange: onChange,
            formFocus: focus[name],
        };
    };
}
