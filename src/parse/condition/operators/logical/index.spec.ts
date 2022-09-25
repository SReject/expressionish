import notOperatorDef from './operators/not';
import andOperatorDef from './operators/and';
import orOperatorDef from './operators/or';
import { notOperator, default as operatorMap } from './index';

test('Exports default as map instance', () => {
    expect(operatorMap).toBeInstanceOf(Map);
});

test('Exports not operator', () => {
    expect(notOperator === notOperatorDef).toBe(true);
});

test('Addresses \'and\' operator as &&', () => {
    expect(operatorMap.has('&&')).toBe(true);
    expect(operatorMap.get('&&') === andOperatorDef).toBe(true);
});

test('Addresses \'or\' operator as ||', () => {
    expect(operatorMap.has('||')).toBe(true);
    expect(operatorMap.get('||') === orOperatorDef).toBe(true);
});