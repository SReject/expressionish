import isPrimitive from "./is-primitive";

export default (subject: any) : string | void => {
    if (subject != null) {

        if (isPrimitive(subject)) {
            return String(subject);
        }

        subject = JSON.stringify(subject);
        if (subject != null) {
            return subject;
        }
    }
};