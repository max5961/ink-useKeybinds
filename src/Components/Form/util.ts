export function mapIncludes(map: string[][], name: string): boolean {
    for (let i = 0; i < map.length; ++i) {
        for (let j = 0; j < map[i].length; ++j) {
            if (map[i][j] === name) return true;
        }
    }
    return false;
}
