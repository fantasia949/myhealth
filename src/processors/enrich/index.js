import inferData from "./inferData";

export default (entries) => {
  entries = inferData(entries);
  return entries;
};
