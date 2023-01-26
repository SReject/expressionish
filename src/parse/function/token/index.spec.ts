import '../../../../jest/helpers';

import TokenType from '../../../types/token-types';

import FunctionToken from './index';
import Token from '../../token';
import { TextToken } from '../../text/';
import { type IFunctionHandler, type IFunctionLookup } from '../../../types/options';

const base = {
    prefix: '$',
    value: 'test',
    arguments: [
        new TextToken({value: 'a'}),
        new TextToken({value: 'b'})
    ]
};

describe('Default Export', () => {
    test('Is a constructor', () => {
        expect(typeof FunctionToken).toBe('function');
        expect(FunctionToken).toBeInstanceOf(Function);
        expect(FunctionToken.prototype).toBeDefined();
    });

    test('Has .toJSON() function', () => {
        expect(FunctionToken.prototype).toHaveOwnProperty('toJSON');
        expect(typeof FunctionToken.prototype.toJSON).toBe('function');
    });

    test('Has .evaluate() function', () => {
        expect(FunctionToken.prototype).toHaveOwnProperty('evaluate');
        expect(typeof FunctionToken.prototype.evaluate).toBe('function');
    });
});

describe('Constructor', () => {

    test('Errors when token is nullish', () => {
        expect(() => {
            // @ts-expect-error: Testing nullish token
            new FunctionToken();
        }).toThrow();
    });

    test('Errors when token is not an object', () => {
        expect(() => {
            // @ts-expect-error: Testing input is not an object
            new FunctionToken(true);
        }).toThrow();
    });

    test('Errors when token.prefix is not a string', () => {
        expect(() => {
            // @ts-expect-error: Testing nullish token.prefix
            new FunctionToken({});
        }).toThrow();

        expect(() => {
            // @ts-expect-error: Testing token.prefix is not a string
            new FunctionToken({prefix: true});
        }).toThrow();
    });

    test('Errors when token.value is not a string', () => {
        expect(() => {
            // @ts-expect-error: Testing nullish token.value
            new FunctionToken({prefix: '$'});
        }).toThrow();

        expect(() => {
            // @ts-expect-error: Testing token.value is not string
            new FunctionToken({prefix: '$', value: true});
        }).toThrow();
    });

    test('Errors when token.arguments is not a populated array', () => {
        expect(() => {
            // @ts-expect-error: Testing unspecified arguments input
            new FunctionToken({prefix: '$', value: ''});
        }).toThrow();

        expect(() => {
            // @ts-expect-error: Testing non array arguments input
            new FunctionToken({prefix: '$', value: '', arguments: true});
        }).toThrow();

        expect(() => {
            // @ts-expect-error: Testing empty arguments array
            new FunctionToken({prefix: '$', value: '', arguments: []});
        }).toThrow();
    });

    test('Errors when token.arguments contains non-token instance', () => {
        expect(() => {
            // @ts-expect-error: Testing empty arguments array
            new FunctionToken({prefix: '$', value: '', arguments: ['']});
        }).toThrow();
    });

    test('Errors when neither handler or lookupFn are defined', () => {
        expect(() => {
            // @ts-expect-error: Testing neither handler or lookupFn specified
            new FunctionToken({...base});
        }).toThrow();
    });

    test('Errors when handler is not an object', () => {
        expect(() => {
            // @ts-expect-error: Testing handler is not an object
            new FunctionToken({...base, handler: true});
        }).toThrow();
    });

    test('Errors when handler.evaluator is nullish', () => {
        expect(() => {
            // @ts-expect-error: Testing handler.evaluator is not specified
            new FunctionToken({...base, handler: { }});
        }).toThrow();
    });

    test('Errors when handler.evaluator is not a function', () => {
        expect(() => {
            // @ts-expect-error: Testing evaluator is not a function
            new FunctionToken({...base, handler: { evaluator: ''}});
        }).toThrow();
    });

    test('Errors when specified handler.stackCheck is not a function', () => {
        expect(() => {
            // @ts-expect-error: Testing stackCheck is not a function
            new FunctionToken({...base, handler: { stackCheck: '' }});
        }).toThrow();
    });

    test('Errors when specified handler.argsCheck is not a function', () => {
        expect(() => {
            // @ts-expect-error: Testing argsCheck is not a function
            new FunctionToken({...base, handler: { argsCheck: '' }});
        }).toThrow();
    });

    test('Errors when specified lookupFn is not a function', () => {
        expect(() => {
            // @ts-expect-error: Testing specified lookupFn is not a function
            new FunctionToken({...base, lookupFn: true});
        }).toThrow();
    });

    test('Constructs without error when input is valid', () => {
        expect(() => {
            new FunctionToken({...base, handler: { evaluate: async () => undefined } });
        }).not.toThrow();
    });
});

describe('Instance', () => {
    const handler : IFunctionHandler = { evaluate: async () => undefined };
    const token = new FunctionToken({...base, handler });

    test('Is instance of ListToken and Token', () => {
        expect(token).toBeInstanceOf(FunctionToken);
        expect(token).toBeInstanceOf(Token);
    });

    test('Sets .type to TokenType.FUNCTION', () => {
        expect(token.type).toBe(TokenType.FUNCTION);
    });

    test('Stores function identifier(.value)', () => {
        expect(token.value).toBe('test');
    });

    test('Stores prefix', () => {
        expect(token.prefix).toBe('$');
    });

    test('Stores arguments', () => {
        expect(token.arguments === base.arguments).toBe(true);
    });

    test('Stores handler', () => {
        expect(token.handler === handler).toBe(true);
    });

    test('Stores lookupFn', () => {
        const handler : IFunctionHandler = { evaluate: async () => undefined };
        const lookupFn : IFunctionLookup = async () => handler;
        const token = new FunctionToken({ ...base, lookupFn });
        expect(token.lookupFn === lookupFn).toBe(true);
    });
});

describe('Instance#toJSON() ', () => {
    const handler : IFunctionHandler = { evaluate: async () => undefined };
    let token : FunctionToken;
    beforeEach(() => {
        token = new FunctionToken({...base, handler });
    });

    test('calls super.toJSON()', () => {
        const spy = jest.spyOn(Token.prototype, 'toJSON');
        token.arguments = [];

        expect(() => token.toJSON()).not.toThrow();
        expect(spy).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();
    });

    test('Returns prefix', () => {
        const result = token.toJSON();
        expect(result).toHaveOwnProperty('prefix', '$');
    });

    test('Returns arguments', () => {
        const result = token.toJSON();
        expect(result).toHaveOwnProperty('arguments');
        expect(result.arguments).toHaveLength(2);
    });
});