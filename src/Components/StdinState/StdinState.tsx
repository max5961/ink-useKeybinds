import React, { useContext, createContext, PropsWithChildren } from "react";
import { useKeybinds } from "../../use-keybinds/useKeybinds.js";
import assert from "assert";
import { Text } from "ink";

type StdinStateContext = {
    register: string;
    event: string;
};

const StdinStateContext = createContext<StdinStateContext | null>(null);

export function StdinState({ children }: PropsWithChildren): React.ReactNode {
    const { register, event } = useKeybinds(
        {},
        { priority: "always", trackState: true },
    );

    return (
        <StdinStateContext.Provider value={{ register, event }}>
            {children}
        </StdinStateContext.Provider>
    );
}

function useStdinStateContext() {
    const context = useContext(StdinStateContext);
    assert(context, "This hook can only be used within a StdinState component");
    return context;
}

StdinState.Register = function Register(): React.ReactNode {
    let { register } = useStdinStateContext();

    while (register.length < 2) {
        register += " ";
    }

    return <Text>{register}</Text>;
};

StdinState.Event = function Event(): React.ReactNode {
    const { event } = useStdinStateContext();
    return <Text>{event}</Text>;
};

StdinState.EventOrRegister = function EventOrRegister(): React.ReactNode {
    const { register, event } = useStdinStateContext();

    if (event) {
        return <Text>{event}</Text>;
    } else {
        return <Text>{register}</Text>;
    }
};
