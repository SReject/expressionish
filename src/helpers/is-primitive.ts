export default (subject: unknown) : boolean => (
    typeof subject === 'boolean' ||
    (typeof subject === 'number' && Number.isFinite(subject)) ||
    typeof subject === 'string'
);