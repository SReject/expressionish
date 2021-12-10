const hasOwnProperty = Object.prototype.hasOwnProperty;
export const has = (subject, key) => hasOwnProperty.call(subject, key);