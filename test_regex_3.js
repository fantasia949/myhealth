const expression = "y = 2x + 0";
const keyX = "Thyroxine (x)";
const keyY = "Yeast";
const formattedExpr = expression
  .replace(/\bx\b/g, keyX)
  .replace(/^y\s*=/i, `${keyY} = `);
console.log(formattedExpr);
