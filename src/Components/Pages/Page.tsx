import { Box } from "ink";
import React, { PropsWithChildren } from "react";

export function Page({ children }: PropsWithChildren): React.ReactNode {
    return (
        <Box height="100%" width="100%">
            {children}
        </Box>
    );
}

// usePageFocus
