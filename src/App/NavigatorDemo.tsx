// Register.setRegisterSize(2);
//
// // prettier-ignore
// const navigatorOne = [
//     ["A", "B"],
//     ["C", "D"],
//     ["E"],
//     ["F", "G"]
// ];
//
// // prettier-ignore
// const navigatorTwo = [
//     ["A", "B"],
//     ["C", "D"],
//     ["E"],
//     ["F", "G"],
//     ["H"],
//     ["I"],
//     ["J"],
//     ["K"],
// ]
//
// // prettier-ignore
// type Nav = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";
//
// export default function App(): React.ReactNode {
//     const { exit } = useApp();
//     useKeybinds({ quit: { input: "q" } });
//     useEvent("quit", () => exit());
//
//     const [navOne, setNavOne] = useState(true);
//
//     // prettier-ignore
//     const { node, focus } = useNavigator<Nav>(navOne ? navigatorOne : navigatorTwo, {
//         keybinds: "vi",
//     });
//
//     useKeybinds({ toggleNav: { key: "f5" } });
//
//     useEvent("toggleNav", () => {
//         setNavOne(!navOne);
//     });
//
//     const color = (node: Nav) => (focus[node] ? "blue" : "");
//
//     if (navOne) {
//         return (
//             <Box width={50} flexDirection="column" borderStyle="round">
//                 <Box flexDirection="row">
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("A")}
//                     >
//                         <Text>Box A</Text>
//                     </Box>
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("B")}
//                     >
//                         <Text>Box B</Text>
//                     </Box>
//                 </Box>
//                 <Box flexDirection="row">
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("C")}
//                     >
//                         <Text>Box C</Text>
//                     </Box>
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("D")}
//                     >
//                         <Text>Box D</Text>
//                     </Box>
//                 </Box>
//                 <Box flexDirection="row">
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("E")}
//                     >
//                         <Text>Box E</Text>
//                     </Box>
//                 </Box>
//                 <Box flexDirection="row">
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("F")}
//                     >
//                         <Text>Box F</Text>
//                     </Box>
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("G")}
//                     >
//                         <Text>Box G</Text>
//                     </Box>
//                 </Box>
//             </Box>
//         );
//     } else {
//         return (
//             <Box width={50} flexDirection="column" borderStyle="round">
//                 <Box flexDirection="row">
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("A")}
//                     >
//                         <Text>Box A</Text>
//                     </Box>
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("B")}
//                     >
//                         <Text>Box B</Text>
//                     </Box>
//                 </Box>
//                 <Box flexDirection="row">
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("C")}
//                     >
//                         <Text>Box C</Text>
//                     </Box>
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("D")}
//                     >
//                         <Text>Box D</Text>
//                     </Box>
//                 </Box>
//                 <Box flexDirection="row">
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("E")}
//                     >
//                         <Text>Box E</Text>
//                     </Box>
//                 </Box>
//                 <Box flexDirection="row">
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("F")}
//                     >
//                         <Text>Box F</Text>
//                     </Box>
//                     <Box
//                         borderStyle="round"
//                         width="50"
//                         borderColor={color("G")}
//                     >
//                         <Text>Box G</Text>
//                     </Box>
//                 </Box>
//                 <Box borderStyle="round" width="50" borderColor={color("H")}>
//                     <Text>Box H</Text>
//                 </Box>
//                 <Box borderStyle="round" width="50" borderColor={color("I")}>
//                     <Text>Box I</Text>
//                 </Box>
//                 <Box borderStyle="round" width="50" borderColor={color("J")}>
//                     <Text>Box J</Text>
//                 </Box>
//                 <Box borderStyle="round" width="50" borderColor={color("K")}>
//                     <Text>Box K</Text>
//                 </Box>
//             </Box>
//         );
//     }
// }
