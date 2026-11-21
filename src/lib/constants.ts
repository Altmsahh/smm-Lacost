// Application-wide constants

export const APP_NAME = "SMM Lacost";

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-zinc-800 text-gray-300 border border-zinc-700",
  in_progress: "bg-blue-950/40 text-blue-400 border border-blue-800/40",
  completed: "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40",
  partial: "bg-orange-950/40 text-orange-400 border border-orange-800/40",
  cancelled: "bg-red-950/40 text-red-400 border border-red-800/40",
  refunded: "bg-purple-950/40 text-purple-400 border border-purple-800/40",
};

export const ITEMS_PER_PAGE = 20;
