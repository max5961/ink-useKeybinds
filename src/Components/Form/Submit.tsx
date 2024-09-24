import React, { PropsWithChildren } from "react";
import { Binding, useKeybinds } from "../../use-keybinds/useKeybinds.js";
import { useFormContext } from "./Form.js";
import { useEvent } from "../../use-keybinds/useEvent.js";
import { Text } from "ink";
import { Props as TextProps } from "../../../node_modules/ink/build/components/Text.js";

export function Submit(
    props: TextProps &
        PropsWithChildren & { submitBinding?: Binding | Binding[] },
): React.ReactNode {
    const formContext = useFormContext();

    // prettier-ignore
    if (!formContext) throw new Error("Submit component must be used within Form component")

    useKeybinds({ SUBMIT_FORM: props.submitBinding || { key: "return" } });

    useEvent("SUBMIT_FORM", () => {
        formContext.FORM_EMITTER.emit("SUBMIT");
    });

    return <Text {...props}>{props.children}</Text>;
}
