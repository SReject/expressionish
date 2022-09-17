export default (subject: unknown) : boolean => {
    return (
        typeof subject === 'boolean' ||
        (typeof subject === 'number' && Number.isFinite(subject)) ||
        typeof subject === 'string'
    );
}