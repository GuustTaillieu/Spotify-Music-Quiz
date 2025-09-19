import { LocalUser } from "@music-quiz/server/database/schema";
import { MouseEventHandler } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/button";

type UserFollowButtonProps = {
  targetUserId: LocalUser["id"];
  isFollowing: boolean;
};

export const UserFollowButton = ({
  targetUserId,
  isFollowing,
}: UserFollowButtonProps) => {
  const { currentUser } = useCurrentUser();
  const { followMutation, unfollowMutation } = useUserMutations();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();

    if (isFollowing) {
      unfollowMutation.mutate({ id: targetUserId });
    } else {
      followMutation.mutate({ id: targetUserId });
    }
  };

  if (!currentUser || currentUser.id === targetUserId) return null;

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={handleClick}
      disabled={followMutation.isPending || unfollowMutation.isPending}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};
