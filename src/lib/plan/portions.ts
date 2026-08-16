export const PORTION_OPTIONS = [0.5, 1, 1.5, 2] as const;
export type PortionOption = (typeof PORTION_OPTIONS)[number];
