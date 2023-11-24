export * from "./validators";

export const classnames = (...args: any[]) => {
  return args.filter(Boolean).join(" ");
};
