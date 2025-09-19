import { User } from "@advanced-react/server/database/schema";

import { UserAvatar } from "./user-avatar";

type UserAvatarListProps = {
  users: User[];
  totalCount: number;
  limit?: number;
};

export const UserAvatarList = ({
  users,
  totalCount,
  limit = 5,
}: UserAvatarListProps) => {
  const displayedUsers = users.slice(0, limit);
  const remainingCount = totalCount - limit;

  return (
    <div className="flex flex-wrap gap-2">
      {displayedUsers.map((user) => (
        <UserAvatar key={user.id} user={user} showName={false} />
      ))}
      {remainingCount > 0 && (
        <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
