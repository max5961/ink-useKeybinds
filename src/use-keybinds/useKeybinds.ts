import { useEffect, useRef, useState } from "react";
import Register, { EVT } from "./Register.js";
import { Key } from "./Keycodes.js";
import { randomUUID } from "crypto";
import { Priority, useKeybindPriority } from "./KeybindProcessingGate.js";
import { usePageFocus } from "../Components/Sequence/SequenceUnit/PageContext.js";
import { useItemFocus } from "../Components/Sequence/SequenceUnit/ItemContext.js";

type Opts = {
    /*
     * Defaults to false. returns { register: string; event: string }
     * 'register' stores the last 1-2 alphanumeric key presses and is wiped out
     * when a event is matched
     * 'event' is the last event to have been matched
     * */
    trackState?: boolean;

    /*
     * Defaults to "default"
     * "never" | "default" | "override" | "always" | "textinput"
     * Determines if the configuration will be processed on keypress events
     * based on priorities of other instances of this hook elsewhere in the app.
     * default and override don't effect always, but textinput overrides all
     * priorities including always
     * */
    priority?: Priority;
};

type Return = StdinData;

/*
 * Responsible for responding to keypress events and processing the KeyBinds
 * object passed as an argument.  Returns { register, event } which is updated
 * on every keypress if the trackState option is set.  trackState is defaulted
 * to false
 * */
export function useKeybinds(kbConfig: KeyBinds, opts?: Opts): Return {
    opts = { trackState: false, priority: "default", ...opts };

    const ProcessingGate = useKeybindPriority();

    const PRIORITY = opts.priority || "default";
    const [ID] = useState(randomUUID());

    const [data, setData] = useState<StdinData>({
        register: "",
        event: "",
    });

    /*
     * If not already listening to the stdin stream, start listening
     * */
    if (PRIORITY !== "never") {
        Register.listen();
    }

    const isPageFocus = usePageFocus();
    const isItemFocus = useItemFocus();
    const canProcess =
        ProcessingGate.canProcess(ID, PRIORITY) && isPageFocus && isItemFocus;

    /*
     * Unsubscribe and resubscribe this hook to keypress events every render so
     * that there aren't any untracked listeners
     * */
    const unsubscribe = useRef<() => void>(() => {});
    unsubscribe.current();
    if (canProcess) {
        unsubscribe.current = Register.subscribe(EVT.keypress, handleStdin);
    }

    const renderCount = useRef(0);
    if (++renderCount.current === 1) {
        Register.checkSuccessfulMount();
    }

    useEffect(() => {
        ProcessingGate.updatePriority(ID, PRIORITY);
        Register.hasMounted();

        return () => {
            unsubscribe.current();
            ProcessingGate.removeHook(ID);
        };
    }, []);

    useEffect(() => {
        ProcessingGate.updatePriority(ID, PRIORITY);
    }, [opts.priority]);

    useEffect(() => {
        if (canProcess) {
            return;
        }

        if (opts.trackState) {
            setData({ event: "", register: "" });
        }
    }, [opts.priority]);

    function handleStdin(stdin: string) {
        Register.processConfig(kbConfig);

        const register = Register.getCharRegister();
        const event = Register.getCommand();

        if (opts?.trackState) {
            setData({
                register,
                event: event || "",
            });
        }

        // Only emits if an event has not already been emitted this processing cycle
        Register.emit(event, stdin);
    }

    return data;
}

export type KeyBinds = {
    [key: string | number]: Binding[] | Binding;
};

export type Binding = {
    key?: Key;
    notKey?: Key[];
    input?: string;
    notInput?: string[];
};

export type StdinData = {
    register: string;
    event: string;
};
