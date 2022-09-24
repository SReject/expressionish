export default (subject: unknown) : null | number => {
    if (
        subject != null &&
        typeof subject !== 'object' &&
        subject !== ''
    ) {
        subject = Number(subject);
        if (Number.isFinite(subject)) {
            return <number>subject;
        }
    }
    return null;
}