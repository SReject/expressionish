export default (value: unknown) : string => {
    if (value == null)
        return '\\';

    if (typeof value !== 'string')
        throw new Error('TODO');

    if (value == '')
        throw new Error('TODO');

    if (value.length !== 1)
        throw new Error('TODO');

    if (/[!\s'"]/.test(value))
        throw new Error('TODO');

    return value;
}