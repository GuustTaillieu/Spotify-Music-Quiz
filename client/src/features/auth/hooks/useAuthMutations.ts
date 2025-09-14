import { toast } from "sonner";

import { trpc } from "@/router";

type useAuthMutationsProps = {
  logout?: {
    onSuccess?: () => void;
  };
};

export const useAuthMutations = (options?: useAuthMutationsProps) => {
  const utils = trpc.useUtils();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();
      await utils.notifications.unreadCount.reset();

      options?.logout?.onSuccess?.();

      toast("Logged out", {
        description: "You have been logged out successfully.",
      });
    },
    onError: (error) => {
      toast.error("Error logging out", {
        description: error.message,
      });
    },
  });

  return {
    logoutMutation,
  };
};
