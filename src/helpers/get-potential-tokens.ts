import type IPreToken from '../types/pre-token';
import type ParserOptions from '../types/options';

import split from './unicode-safe-split';

const isPreLogic = (subject: string, index: number) : boolean => index < 1 ? true : /^\s/.test(subject[index - 1]);

const isPostLogic = (subject: string, index: number) : boolean => index + 2 >= subject.length ? true : /^\s$/.test(subject[index + 2]);

/** Split input string into array of potential tokens */
export default (options: ParserOptions, subject: string) : IPreToken[] => {

    // remove leading and trailing spaces
    let startCursor = 0;
    while (subject.length && subject[startCursor] === ' ') {
        startCursor += 1;
    }
    let endCursor = subject.length - 1;
    while (subject.length && subject[endCursor] === ' ') {
        endCursor -= 1;
    }
    subject = subject.slice(startCursor, endCursor + 1);


    const result : IPreToken[] = [];

    let textToken : null | {position: number, value: string} = null;
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

            // \\<char>, $<prefix>
            const nextChar = subject[position + 1];
            if (
                nextChar != null &&
                nextChar !== '' &&
                /^\s$/.test(nextChar) &&
                (
                    char === '\\' ||
                    (char === '$' && /^[^a-z\d\\]$/i.test(nextChar))
                )
            ) {
                if (textToken !== null) {
                    result.push(textToken);
                    textToken = null;
                }
                result.push({
                    position: position,
                    value: char
                }, {
                    position: position + 1,
                    value: nextChar
                });
                return 1;
            }

            // Block Escape, &&, ||
            const seq = subject.slice(position, position + 2);
            if (
                seq === '``' ||
                (
                    (seq === '&&' || seq === '||') &&
                    isPreLogic(subject, position) &&
                    isPostLogic(subject, position)
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