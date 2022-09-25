import '../../../../../../../jest/helpers';

import operator from './index';

test('Exports an operator definition', () => {
    expect(operator).toBeAnOperator();
});