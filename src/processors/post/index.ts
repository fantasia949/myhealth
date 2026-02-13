import applyTag from "./tag";
import applyRange from "./range";
import applyDescription from "./description";

const postProcessEntry = (entry: Entry): Entry => {
  const funcs = [applyTag, applyRange, applyDescription];
  return funcs.reduce((result, func) => func(result), entry);
};

export default (entries: Entry[]): Entry[] => {
  return entries.map(postProcessEntry);
};
