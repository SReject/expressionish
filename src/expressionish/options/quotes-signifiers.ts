export interface IQuotesQuantified {
    open: string;
    close: string;
}

export type IQuotesOptions = false | 'single' | 'double' | 'both' | IQuotesQuantified | IQuotesQuantified[];

export default (value: unknown, significant: string[]) : IQuotesQuantified[] => {
    if (value === false)
        return [];

    if (value == null || value === 'double')
        return [ Object.freeze({open: '"', close: '"'}) ];

    if (value === 'single')
        return [ Object.freeze({ open: "'", close: "'"}) ];

    if (value === 'both')
        return [
            Object.freeze({ open: '"', close: '"'}),
            Object.freeze({ open: "'", close: "'"})
        ];

    if (typeof value !== 'object')
        throw new Error('TODO');

    if (!Array.isArray(value))
        value = [value];

    const invalidMulti : string[] = [];
    const invalidChars = new RegExp(`[!\\s${
        significant
            .filter(value => {
                if (value.length > 1) {
                    invalidMulti.push(value);
                    return false;
                }
                return value.length === 1;
            })
            .map(value => `\\${value}`)
            .join('')
    }]`);
    const inuse : string[] = [];
    const isValid = (value: unknown) => (
        typeof value === 'string' &&
        value.length === 1 &&
        !invalidChars.test(value) &&
        !invalidMulti.some(multi => value.includes(multi)) &&
        !inuse.some(used => used === value)
    );

    return (<IQuotesQuantified[]>value)
        .filter(value => value != null)
        .map(value => {
            if (typeof value !== 'object')
                throw new Error('TODO');

            const { open, close } = value;

            if (!isValid(open))
                throw new Error('TODO');

            if (!isValid(close))
                throw new Error('TODO');

            inuse.push(open);
            if (open !== close)
                inuse.push(close);

            return { open, close };
        });
}