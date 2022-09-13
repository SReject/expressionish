export default (subject: any) : null | number => {
    if (subject != null && subject !== '') {
        subject = Number(subject);
        if (Number.isFinite(subject)) {
            return subject;
        }
    }
    return null;
}