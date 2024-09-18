import React, { useState } from "react";
import { Box, Text } from "ink";
import { usePageFocus } from "../Components/Sequence/SequenceUnit/PageContext.js";

export default function PageThree(): React.ReactNode {
    const isPageFocus = usePageFocus();

    const borderColor = isPageFocus ? "cyan" : undefined;

    return (
        <Box
            height="100%"
            width="100%"
            borderColor={borderColor}
            alignItems="center"
            justifyContent="center"
        >
            <Text>Page Three</Text>
        </Box>
    );
}
