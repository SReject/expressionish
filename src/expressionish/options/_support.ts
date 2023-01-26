import isObject from 'src/helpers/is-object';

export type RequireAtLeastOne<T> = { [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>; }[keyof T]

export type dispsosition = 'append' | 'override';

export interface IQuantifiedList<T> {
    disposition?: dispsosition;
    items: T;
}

export const verifyQuantifiedList = (subject: unknown) => {
    if (!isObject(subject)) {
        throw new Error('TODO');
    }

    const { disposition, items } = <IQuantifiedList<unknown>>subject;
    if (disposition == null || (disposition !== 'append' && disposition !== 'override')) {
        throw new Error('TODO');
    }

    if (items == null || (!isObject(items) && !Array.isArray(items))) {
        throw new Error('TODO');
    }
}