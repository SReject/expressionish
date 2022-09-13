export default (subject: any) : boolean => {
    return (
        typeof subject === 'boolean' ||
        (typeof subject === 'number' && Number.isFinite(subject)) ||
        typeof subject === 'string'
    );
}