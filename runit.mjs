import evaluate from "./src/evaluate.mjs";


const handlers = [
    {handle: 'txt', argsCheck: () => {}, evaluator: () => 'evaled_var_text'},
    {handle: 'ten', argsCheck: () => {}, evaluator: () => 10},
    {handle: 'sum', argsCheck: () => {}, evaluator: (meta, ...args) => {
        return args.map(item => Number(item)).reduce((acc, cur) => acc + cur, 0)
    }}
];

const input = `leading "quoted_text" $txt trailing $sum[1, 2]`

console.log('Input:\r\n', input);

(async function () {
    let result = await evaluate(handlers, {
        trigger: true,
        expression: input
    });

    console.log('\r\nResult:\r\n', result);
})();