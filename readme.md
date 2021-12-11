# Comparators

| Comparator | Example          | Description |
|:----------:|:----------------:|-|
| `===`      | `1 === 1`        | The left side exactly equals the right side |
| `!==`      | `1 === 2`        | The left side does not exactly equal the right side |
| `==`       | `1 == 1`         | The left side loosey equals\* the right side |
| `!=`       | `1 == 2`         | The left side does not loosey equals\* the right side |
| `<`        | `1 < 2`          | The left side is a number and less than the right side |
| `<=`       | `1 <= 1`         | The left side is a number and less than or equal to the right side |
| `>`        | `2 > 1`          | The left side is a number and greater than the right side |
| `>=`       | `1 >= 1`         | The left side is a number and greater than or equal to the right side |
| `exists`   | `1 exists`       | The left side is not null or empty text |
| `!exists`  | `"" !exists`     | The left side is null or empty text |
| `regex`    | `a regex /a/`    | The left side matches the right side's regex pattern |
| `!regex`   | `a !regex /b/`   | The left side does not match the right side's regex pattern |
| `iswcm`    | `ab iswcm a?`    | The left side matches the right side's wildcard pattern |
| `!iswcm`   | `bc !iswcm a?`   | The left side does not match the right side's wildcard pattern |
| `iswcmcs`  | `ab iswcmcs a?`  | The left side matches the right side's wildcard pattern (case-sensitive) |
| `!iswcmcs` | `bc !iswcmcs a?` | The left side does not match the right side's wildcard pattern (case-sensitive) |