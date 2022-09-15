import { type IToken } from '../tokens/base';
import ParserOptions from '../types/options';

import split from './unicode-safe-split';

/** Split input string into array of potential tokens */
export default (options: ParserOptions, subject: string) : IToken[] => {

    const result : IToken[] = [];

    let textToken : null | IToken = null;
    split(
        subject,
        (subject: string, char: string, position: number) : number | void => {

            // EOL
            if (char === '\n' || char === '\r') {
                if (options.eol === 'error') {
                    throw new Error('TODO - SyntaxError: illegal character');
                }

                if (!options.eol || options.eol === 'remove') {
                    return;
                }

                if (textToken) {
                    result.push(textToken);
                    textToken = null;
                }

                let inc = 0;
                if (options.eol === 'space') {
                    while (
                        subject[position + inc + 1] === '\n' ||
                        subject[position + inc + 1] === '\r'
                    ) {
                        inc += 1;
                    }
                    char = ' ';
                }

                result.push({
                    position,
                    value: char
                });

                return inc;
            }

            if (
                char === '\\' &&
                subject[position + 1] != null &&
                subject[position + 1] !== ''
            ) {
                if (textToken !== null) {
                    result.push(textToken);
                    textToken = null;
                }
                result.push({
                    position: position,
                    value: '\\'
                }, {
                    position: position + 1,
                    value: subject[position + 1]
                });
                return 1;
            }

            // Block Escape, Single Escape, &&, ||
            const seq = subject.slice(position, position + 2);
            if (
                seq === '``' ||
                (
                    (seq === '&&' || seq === '||') &&
                    subject[position - 1] === ' ' &&
                    subject[position + 2] === ' '
                )
            ) {
                if (textToken !== null) {
                    result.push(textToken);
                    textToken = null;
                }
                result.push({
                    position: position,
                    value: subject.slice(position, position + 2)
                });
                return 1;
            }

            // Non potentially significant characters
            if (char[1] || /^[a-z\d]$/i.test(char)) {
                if (textToken == null) {
                    textToken = {
                        position,
                        value: char
                    };
                } else {
                    textToken.value += char;
                }
                return;
            }

            // All others
            if (textToken !== null) {
                result.push(textToken);
                textToken = null;
            }
            result.push({
                position: position,
                value: char
            });
        }
    );

    if (textToken) {
        result.push(textToken);
    }
    return result;
}