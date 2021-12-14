# Expressions
An expression is text consisting of literal text, quotes, escape sequences and variables.

# Format

## Quotes
Quoted text is treated as-is except in the case of escape sequences.

`\"` is treated as a literal `"`  
`\\` is treated as a literal `\`

| Example   | Evaluation Result |
|-----------|--------|
| "text"    | text   |
| "text\""  | text"  |
| "text\\"  | text   |
| "text\\"" | text\" |
| "$text"   | $text  |

## Variables
Variables come in two forms: those without arguments and those with.

Variables can occur anywhere within an expression and can even be used as arguments to another variable.

Variable names always start with `$` and are followed by a-z followed by a-z 0-9. Arguments are listed inside of `[]`, delimited by a comma(`,`)

| Example | Evaluation Result | Notes |
|--|--|--|
| `$ten` | 10 | |
| `$sum[1, 2]` | 3 | |
| `$sum[$ten, 1]` | 11 | |
| `text$ten` | text10 | |
| `$ten"text"` | 10text | |
| `$a` | $a | Not a valid variable name so treated as-is |
| `$10` | $10 | Not a valid variable name so treated as-is |

## $if Variable
the `$if` variable is a special variable that consists of a condition and two follwoing  arguments.

When the specified condition is true, the first argument is returned as the result otherwise the second argument is returned as the result.

You can find more info on conditions [here](./conditions.md)

| Example | Evaluation Result | Notes |
|--|--|--|
| `$if[1 === 1, yes, no]` | yes | |
| `$if[1 === 2, yes, no]` | no | |
| `$if[1 === 1, yes]` | yes | |
| `$if[1 === 2, yes]` | | Returns an empty string when a second argument is given |
| `$ten is $if[$ten > 5, greater than, less than or equal to] 5` | 10 is greater than 5 | |