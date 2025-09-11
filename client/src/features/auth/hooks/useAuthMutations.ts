import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";

type useAuthMutationsProps = {
  logout?: {
    onSuccess?: () => void;
  };
};

export const useAuthMutations = (options?: useAuthMutationsProps) => {
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();
      await utils.notifications.unreadCount.reset();

      options?.logout?.onSuccess?.();

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    logoutMutation,
  };
};
