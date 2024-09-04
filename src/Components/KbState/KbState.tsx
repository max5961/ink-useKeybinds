import React, { useContext, createContext, PropsWithChildren } from "react";
import useKeybinds from "../../useKeybinds.js";
import assert from "assert";
import { Text } from "ink";

type KbStateContext = {
    register: string;
    command: string;
};

const KbStateContext = createContext<KbStateContext | null>(null);

let i = 0;
export default function KbState({
    children,
}: PropsWithChildren): React.ReactNode {
    const { register, command } = useKeybinds(
        {},
        { priority: "always", trackState: true },
    );

    return (
        <KbStateContext.Provider value={{ register, command }}>
            {children}
        </KbStateContext.Provider>
    );
}

function useKbStateContext() {
    const context = useContext(KbStateContext);
    assert(context, "This hook can only be used within a KbState component");
    return context;
}

KbState.Register = function Register(): React.ReactNode {
    let { register } = useKbStateContext();

    while (register.length < 2) {
        register += " ";
    }

    return <Text>{register}</Text>;
};

KbState.Command = function Command(): React.ReactNode {
    const { command } = useKbStateContext();
    return <Text>{command}</Text>;
};

KbState.CommandOrRegister = function CommandOrRegister(): React.ReactNode {
    const { register, command } = useKbStateContext();

    if (command) {
        return <Text>{command}</Text>;
    } else {
        return <Text>{register}</Text>;
    }
};
