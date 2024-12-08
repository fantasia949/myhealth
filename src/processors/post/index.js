import applyTag from "./tag";
import applyRange from "./range";
import applyDescription from "./description";

const postProcessEntry = (entry) => {
  const funcs = [applyTag, applyRange, applyDescription];
  return funcs.reduce((result, func) => func(result), entry);
};

export default (entries) => {
  return entries.map(postProcessEntry);
};
