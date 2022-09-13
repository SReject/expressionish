const hasOwnProperty = Object.prototype.hasOwnProperty;

export default (subject: any, key: string) => hasOwnProperty.call(subject, key);