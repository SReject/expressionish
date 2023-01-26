export default (value: unknown, significant: string[]) : string => {
    if (value == null)
        return '$';

    if (typeof value !== 'string')
        throw new Error('TODO');

    if (value.length !== 1)
        throw new Error('TODO');

    if (/[!\s'"]/.test(value))
        throw new Error('TODO');

    if (significant !== null && significant.some(significant => value.includes(significant)))
        throw new Error('TODO');

    return value;
}