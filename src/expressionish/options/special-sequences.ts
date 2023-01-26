import has from 'src/helpers/has';
import isObject from '../../helpers/is-object';

import { type IQuantifiedList } from './_support';

type ISpecialSequences = IQuantifiedList<Record<string, string>>;

export type ISpecialSequencesOptions = boolean | ISpecialSequences;

export type ISpecialSequencesQuantified = Record<string, string>;

const defaultSequences : ISpecialSequencesQuantified = {
    't': '\\t',
    'n': '\\n',
    'r': '\\r'
};

export default (value: ISpecialSequencesOptions) : Record<string, string> => {
    if (value === false)
        return Object.freeze({});

    if (value == null || value === true)
        return Object.freeze( { ...defaultSequences });

    if (!isObject(value)) {
        throw new Error('TODO');
    }

    const { disposition = 'append', items} = value;

    if (disposition !== 'append' && disposition !== 'override') {
        throw new Error('TODO');
    }
    if (!isObject(items)) {
        throw new Error('TODO');
    }

    const result : ISpecialSequencesQuantified = {};

    if (disposition === 'append') {
        Object
            .keys(defaultSequences)
            .forEach(key => {
                result[key] = defaultSequences[key];
            });
    }

    Object
        .keys(items)
        .forEach(key => {
            if (typeof key !== 'string')
                throw new Error('TODO');

            if (items[key] == null)
                throw new Error('TODO');

            if (typeof items[key] !== 'string')
                throw new Error('TODO');

            if (has(result, key))
                throw new Error('TODO');

            result[key] = items[key];
        });

    return Object.freeze(result);
}