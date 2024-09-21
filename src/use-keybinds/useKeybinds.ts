import { useEffect, useRef, useState } from "react";
import Register, { EVT } from "./Register.js";
import { Key } from "./Keycodes.js";
import { randomUUID } from "crypto";
import ProcessingGate, { Priority } from "./ProcessingGate.js";
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

    const PRIORITY = opts.priority || "default";
    const [ID] = useState(randomUUID());

    const [data, setData] = useState<StdinData>({
        register: "",
        event: "",
    });

    if (PRIORITY !== "never") {
        Register.listen();
    }

    const isPageFocus = usePageFocus();
    const isItemFocus = useItemFocus();

    // Unsubscribe then resubscribe processing
    const unsubscribe = useRef<() => void>(() => {});
    unsubscribe.current();
    unsubscribe.current = Register.subscribe(EVT.keypress, handleStdin);

    // In the event of an error that prevents mounting, this will remove listeners
    // so that the app exits naturally without requiring sigint
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
        if (ProcessingGate.canProcess(ID, PRIORITY)) {
            return;
        }

        if (opts.trackState) {
            setData({ event: "", register: "" });
        }
    }, [opts.priority]);

    function handleStdin(stdin: string) {
        if (
            isItemFocus &&
            isPageFocus &&
            ProcessingGate.canProcess(ID, PRIORITY)
        ) {
            Register.processConfig(kbConfig);
        }

        const register = Register.getCharRegister();
        const event = Register.getEvent();

        if (opts?.trackState) {
            setData({
                register,
                event: event || "",
            });
        }

        // If an event has not already been processed and event exists, notify
        // subscribers created by useEvent hook
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
