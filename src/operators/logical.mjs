const $not = arg => (arg == null || arg === false || arg === '');

const $and = (...args) => {
    if (!args || !args.length) {
        return false;
    }
    return !args.some(item => $not(item));
};

const $or = (...args) => {
    if (!args || !args.length) {
        return false;
    }
    return args.some(item => (item != null && item !== false && item !== ''));
}

const $nand = (...args) => $not($and(...args));
const $nor = (...args) => $not($or(...args));

export default new Map([
    ['$NOT', $not],

    ['$AND', $and],
    ['$ALL', $and],

    ['$OR',  $or],
    ['$ANY', $or],

    ['$NAND', $nand],
    ['$NALL', $nand],

    ['$NOR',  $nor],
    ['$NANY', $nor]
]);