const hasOwnProperty = Object.prototype.hasOwnProperty;

export default (subject: unknown, key: string) => hasOwnProperty.call(subject, key);