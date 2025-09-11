import { TRPCError } from "@trpc/server";

export const isTrpcError = (error: unknown): error is TRPCError => {
  return (
    error instanceof TRPCError ||
    (error as { code: string }).code === "INTERNAL_SERVER_ERROR"
  );
};
