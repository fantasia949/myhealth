const expression = "y = 2x + 0";
const keyX = "Thyroxine (x)";
const keyY = "Yeast";
const formattedExpr = expression
  .replace(/x/g, keyX)
  .replace(/^y\s*=/i, `${keyY} = `);
console.log(formattedExpr);
