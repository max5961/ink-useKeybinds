import { shallowEqualObjects } from "shallow-equal";
import { FocusState, FormState, UseFormReturn, Errors } from "./useForm.js";
import { mapIncludes } from "./util.js";
import { NavigatorPublicMethods } from "../Navigation/Navigator.js";

export type RegisterOpts = {
    required?: {
        value: boolean;
        message: string;
    };
};

export function useCreateRegister({
    formState,
    focusMapRef,
    focus,
    submitCount,
    errors,
    setErrors,
    internalUtil,
}: {
    formState: FormState;
    focusMapRef: string[][];
    focus: FocusState;
    submitCount: number;
    errors: Errors;
    setErrors: (errors: Errors) => void;
    internalUtil: NavigatorPublicMethods;
}) {
    return (name: string, opts?: RegisterOpts): ReturnType<UseFormReturn["register"]> => {
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

        const move = (d: "up" | "down" | "next"): boolean => {
            const node = internalUtil.getLocation();

            if (d === "up") {
                internalUtil.up();
            } else if (d === "down") {
                internalUtil.down();
            } else if (d === "next") {
                internalUtil.next();
            }

            return node !== internalUtil.getLocation();
        };

        return {
            name: name,
            value: formState[name].value,
            onChange: onChange,
            nameFocused: focus[name],
            insertControl: {
                tab: () => move("next"),
                up: () => move("up"),
                down: () => move("down"),
            },
        };
    };
}
