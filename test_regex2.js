const expr = "y = 2x + 3";
const keyX = "Thyroxine (x)";
const keyY = "Yeast";
let replaced = expr.replace(/x/g, keyX).replace(/^y\s*=/i, `${keyY} =`);
console.log(replaced);
