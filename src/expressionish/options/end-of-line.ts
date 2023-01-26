type IEOLQuantifier = 'keep' | 'remove' | 'space' | 'error';

export type IEndOfLineOptions = IEOLQuantifier | ((eol: string) => string);

export interface IEndOfLineQuantified {
    quantifier: IEOLQuantifier | 'transform';
    transform: (char: string) => string;
}

export default (value: unknown) : IEndOfLineQuantified => {

    if (value === 'error')
        return { quantifier: 'error', transform: () => { throw new Error('TODO') } };

    if (value == null || value === 'keep')
        return { quantifier: 'keep', transform: (char) => char };

    if (value === 'remove')
        return { quantifier: 'remove', transform: () => '' };

    if (value === 'space')
        return { quantifier: 'space', transform: () => ' '};

    if (typeof value === 'function')
        return { quantifier: 'transform', transform: <IEndOfLineQuantified["transform"]>value };

    throw new Error('TODO');

};

