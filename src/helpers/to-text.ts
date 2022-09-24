import isPrimitive from "./is-primitive";

export default (subject: unknown) : string | void => {
    if (
        subject != null &&
        typeof subject !== 'function'
    ) {

        if (isPrimitive(subject)) {
            return String(subject);
        }

        const subjectJSON : string = JSON.stringify(subject);
        if (subjectJSON != null) {
            return subjectJSON;
        }
    }
};