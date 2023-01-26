import has from './has';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const freeze = <T>(subject: T, deepFreeze = false) : T => {
    if (deepFreeze === true && subject != null && typeof subject === 'object') {
        for (const key in subject) {
            if (!has(subject, key) || subject[key] == null || typeof subject[key] !== 'object') {
                continue;
            }
            freeze(subject[key], true);
        }
        freeze(subject, true);
    }
    return subject;
}

export default freeze;