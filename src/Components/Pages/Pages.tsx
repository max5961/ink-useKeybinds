import { Box } from "ink";
import React, { PropsWithChildren } from "react";
import { Binding } from "../../use-keybinds/useKeybinds.js";
import { Page } from "./Page.js";

type Props = PropsWithChildren & {
    nextPageKeys?: Binding | Binding[];
    prevPageKeys?: Binding | Binding[];
    maintainState?: boolean;
};

export function Pages({
    nextPageKeys,
    prevPageKeys,
    maintainState,
    children,
}: Props): React.ReactNode {
    const generated = React.Children.map(children, (child) => {
        return <Page>{child}</Page>;
    });

    return (
        <Box width="100%" height="100%">
            {generated}
        </Box>
    );
}

function Layout({ children }: PropsWithChildren): React.ReactNode {
    // <LayoutContext.Provider value={{}}>
    // </LayoutContext.Provider value={{}}>
    return null;
}

function Foo(): React.ReactNode {
    return (
        <Pages>
            <Layout>
                <Box flexDirection="row">
                    <Box flexGrow={1} height="100%">
                        <Page></Page>
                    </Box>
                    <Box flexGrow={1} height="100%">
                        <Page></Page>
                    </Box>
                </Box>
            </Layout>
            <Page></Page>
            <Page></Page>
        </Pages>
    );
}
