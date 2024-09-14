import { Box } from "ink";
import React, { PropsWithChildren } from "react";
import { List } from "../List/List.js";
import useList from "../List/useList.js";

type Props = PropsWithChildren & {
    pages: React.ReactNode[];
    pageState: any;
};

export function Pages({ pages, pageState }: Props): React.ReactNode {
    return (
        <Box width="100%" height="100%">
            <List items={pages} viewState={pageState} />
        </Box>
    );
}

export function usePages(pages) {
    const { viewState, util } = useList(pages, { navigation: "none" });

    const pageName =
        (pages[util.currentIndex] as React.ReactElement)?.props?.pageName ||
        null;

    const pageUtil = {
        nextPage: util.nextItem,
        prevPage: util.prevItem,
        goToPage: util.goToIndex,
        currentPage: util.currentIndex,
        currentPageName: pageName,
    };

    return { pageState: viewState, util: pageUtil };
}

// function Layout({ children }: PropsWithChildren): React.ReactNode {
//     // <LayoutContext.Provider value={{}}>
//     // </LayoutContext.Provider value={{}}>
//     return null;
// }

// function Foo(): React.ReactNode {
//     return (
//         <Pages >
//             <Layout>
//                 <Box flexDirection="row">
//                     <Box flexGrow={1} height="100%">
//                         <Page></Page>
//                     </Box>
//                     <Box flexGrow={1} height="100%">
//                         <Page></Page>
//                     </Box>
//                 </Box>
//             </Layout>
//             <Page></Page>
//             <Page></Page>
//         </Pages>
//     );
// }
