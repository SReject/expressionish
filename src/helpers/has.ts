const hasOwnProperty = Object.prototype.hasOwnProperty;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default (subject: any, key: string) => (subject != null && hasOwnProperty.call(subject, key) && subject[key] !== undefined);