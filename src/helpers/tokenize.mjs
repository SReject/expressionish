import split from './split.mjs';

export default input => {
    if (input === '') {
        return [''];
    }

    input = split(input);

    let result = [];
    let current = null;
    let idx = 0;

    while (idx < input.length) {
        const char = input[idx];
        switch (char) {
        case '"':
        case '\\':
        case '$':
        case '[':
        case ',':
        case ']':
        case ' ':
            if (current !== null) {
                result.push(current);
                current = null;
            }
            result.push(char);
            break;

        default:
            if (current !== null) {
                current += char;
            } else {
                current = char;
            }
        }

        idx += 1;
    }

    if (current !== null) {
        result.push(current);
    }

    return result;
};