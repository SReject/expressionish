const isNumber = (v1, v2) => {
    if (Number.isNaN(v1)) {
        return false;
    }
    if (v2 == null || v2 === '') {
        return true;
    }
    // TODO: translate v2 into range
};

const regex = (v1, v2) => {
    v1 = ('' + v1);
    v2 = ('' + v2);
    const parts = /^\/(.*)\/([a-z]*)$/i.exec(v2);
    if (parts) {
        return (new RegExp(parts[1], parts[2])).test(v1);
    }
    return (new RegExp(v2)).test(v1);
};

export default {
    '===': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 === v2)
    },
    '!==': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 !== v2)
    },
    '==': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 === v2 || ('' + v1).toLowerCase() === ('' + v2).toLowerCase())
    },
    '!=': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 !== v2 && ('' + v1).toLowerCase() !== ('' + v2).toLowerCase())
    },
    '>': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 > v2)
    },
    '>=': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 >= v2)
    },
    '<': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 < v2)
    },
    '<=': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 <= v2)
    },
    'exists': {
        type: 'condition',
        left: true,
        right: false,
        evaluator: (v1) => (v1 != null && v1 !== '')
    },
    '!exists': {
        type: 'condition',
        left: true,
        right: false,
        evaluator: (v1) => (v1 == null || v1 === '')
    },
    'isnumber': {
        type: 'condition',
        left: true,
        right: 'optional',
        evaluator: isNumber
    },
    '!isnumber': {
        type: 'condition',
        left: true,
        right: 'optional',
        evaluator: (v1, v2) => !(isNumber(v1, v2))
    },
    'regex': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: regex
    },
    '!regex': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => !(regex(v1, v2))
    },
    'AND': {
        type: 'operator',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 && v2)
    },
    'OR': {
        type: 'operator',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 || v2)
    },
    'NOT': {
        type: 'operator',
        left: false,
        right: true,
        evaluator: (v1) => (!v1)
    }
};