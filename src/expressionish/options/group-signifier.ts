interface IGroupSignifier {
    open: string,
    delimiter?: string,
    close: string
}

export type IGroupSignifierOptions = 'parens' | 'brackets' | 'curly' | IGroupSignifier;

export interface IGroupSignifierQuantified {
    open: string,
    delimiter: string,
    close: string
}

export default (value: unknown, significant: string[]) : IGroupSignifierQuantified => {

    if (value == null || value === 'brackets')
        return { open: '[', delimiter: ',', close: ']' };

    if (value === 'parens')
        return { open: '(', delimiter: ',', close: ')' };

    if (value === 'curly')
        return { open: '{', delimiter: ',', close: '}' };

    if (typeof value !== 'object')
        throw new Error('TODO');

    const invalidChars = new RegExp(`[!\\s'"${
        significant
            .filter(value => value.length === 1)
            .map(value => `\\${value}`)
            .join('')
    }]`);

    const isValid = (value: unknown) => (
        typeof value === 'string' &&
        value.length === 1 &&
        !invalidChars.test(value)
    );

    const { open, delimiter = ',', close } = <IGroupSignifier>value;

    if (!isValid(open))
        throw new Error('TODO');

    if (!isValid(delimiter))
        throw new Error('TODO');

    if (!isValid(close))
        throw new Error('TODO');

    if (open === delimiter || delimiter === close || open === close)
        throw new Error('TODO');

    return { open, delimiter, close };
}