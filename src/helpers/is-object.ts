// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (subject: any) => (
    subject != null &&
    typeof subject === 'object' &&
    (
        subject.prototype == null ||
        subject.prototype === Object.prototype
    )
);