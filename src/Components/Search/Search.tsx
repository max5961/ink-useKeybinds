// import React, { useState } from "react";
// import { Input } from "../Input/Input.js";
// import { useFormInput } from "../Input/useFormInput.js";
// import { Binding, useKeybinds } from "../../use-keybinds/useKeybinds.js";
// import { Box, Text } from "ink";
// import { KEYCODES } from "../../use-keybinds/Keycodes.js";
//
// type Props = {
//     wordList: string[];
//     goToIdx(idx: number): void;
//     idx: number;
// };
//
// type State = {
//     matches: number[];
//     direction: "FORWARD" | "BACKWARD";
// };
//
// const enter: Binding[] = [{ input: "/" }, { input: "?" }];
// const exit: Binding[] = [{ key: "return" }, { key: "esc" }];
//
// export function Search({ wordList, goToIdx, idx }: Props): React.ReactNode {
//     const [state, setState] = useState<State>({
//         matches: [],
//         direction: "FORWARD",
//     });
//
//     const { onEvent } = useKeybinds({
//         nextMatch: { input: "n" },
//         prevMatch: { input: "N" },
//     });
//
//     onEvent("prevMatch", () => navMatch("prev"));
//     onEvent("nextMatch", () => navMatch("next"));
//
//     function navMatch(dir: "next" | "prev"): void {
//         const indexOf = state.matches.indexOf(idx);
//         if (!state.matches.length) return;
//
//         if (indexOf === -1) {
//             return goToIdx(state.matches[0]);
//         }
//
//         const nextMatchesIdx = dir === "next" ? indexOf + 1 : indexOf - 1;
//         const nextMatch = state.matches[nextMatchesIdx];
//         if (nextMatch !== undefined) {
//             return goToIdx(nextMatch);
//         }
//         if (dir === "next") {
//             goToIdx(state.matches[0]);
//         } else {
//             goToIdx(state.matches[state.matches.length - 1]);
//         }
//     }
//
//     const text = useFormInput({ enter, exit });
//     function onKeypress(stdin: string) {
//         // prettier-ignore
//         const sortedIndexes = getSortedIndexes(idx, wordList.length, state.direction);
//         // prettier-ignore
//         const matchedIndexes = getMatchedIndexes(sortedIndexes, wordList, `${text.str}${stdin}`);
//
//         setState({
//             ...state,
//             matches: matchedIndexes,
//         });
//         matchedIndexes.length && goToIdx(matchedIndexes[0]);
//     }
//
//     function onEnter(stdin: string) {
//         text.clearText();
//         if (stdin === "/" && state.direction !== "FORWARD") {
//             return setState({ ...state, direction: "FORWARD" });
//         }
//         if (stdin === "?" && state.direction !== "BACKWARD") {
//             return setState({ ...state, direction: "BACKWARD" });
//         }
//     }
//
//     function onSubmit(stdin: string) {
//         if (stdin === KEYCODES.esc) {
//             return text.clearText();
//         }
//
//         if (!state.matches.length) {
//             text.setText(`no matches for '${text.str}'`);
//         }
//     }
//
//     const prefix =
//         state.direction === "FORWARD" ? "Find forward: " : "Find backward: ";
//
//     if (text.str.length === 0 && !text.insert) {
//         return null;
//     }
//
//     return (
//         <Box flexDirection="row">
//             <Text>{prefix}</Text>
//             <Input {...{ text, onSubmit, onEnter, onKeypress }} />
//         </Box>
//     );
// }
//
// function getSortedIndexes(
//     idx: number,
//     length: number,
//     direction: State["direction"] = "FORWARD",
// ): number[] {
//     const sorted: number[] = [];
//
//     if (direction === "FORWARD") {
//         for (let i = idx; i < length; ++i) sorted.push(i);
//         for (let i = 0; i < idx; ++i) sorted.push(i);
//     }
//
//     if (direction === "BACKWARD") {
//         for (let i = idx; i >= 0; --i) sorted.push(i);
//         for (let i = length - 1; i > idx; --i) sorted.push(i);
//     }
//
//     return sorted;
// }
//
// function getMatchedIndexes(
//     sortedIndexes: number[],
//     wordList: string[],
//     searchTerm: string,
// ): number[] {
//     const searchTermSanitized = searchTerm.replaceAll(
//         /[&/\\#,+()$~%.^'":*?<>{}]/g,
//         "",
//     );
//
//     const matches: number[] = [];
//
//     for (const idx of sortedIndexes) {
//         const word = wordList[idx];
//
//         if (word.match(new RegExp(searchTermSanitized, "gmi"))) {
//             matches.push(idx);
//         }
//     }
//
//     return matches;
// }
