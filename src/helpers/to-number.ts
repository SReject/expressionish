export default (subject: unknown) : null | number => {
    if (subject != null && subject !== '') {
        subject = Number(subject);
        if (Number.isFinite(subject)) {
            return <number>subject;
        }
    }
    return null;
}