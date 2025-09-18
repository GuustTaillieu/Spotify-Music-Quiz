import { LocalUser } from "@music-quiz/server/database/schema";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/features/shared/components/ui/avatar";
import { Link } from "@/features/shared/components/ui/link";
import { cn } from "@/lib/utils/cn";

type UserAvatarProps = {
  user: LocalUser;
  showName?: boolean;
  canGoToUserPage?: boolean;
  nameClassName?: string;
  className?: string;
};

export const UserAvatar = ({
  user,
  showName = true,
  canGoToUserPage = true,
  nameClassName,
  className,
}: UserAvatarProps) => {
  return (
    <Link
      to="/users/$userId"
      params={{ userId: user.id }}
      className={cn("flex items-center gap-2", className)}
      disabled={!canGoToUserPage}
    >
      <Avatar className={className}>
        <AvatarImage
          src={user.imageUrl}
          alt={user.name}
          className="object-cover"
        />
        <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
      </Avatar>

      {showName && (
        <span
          className={cn(
            "text-neutral-600 dark:text-neutral-400",
            nameClassName,
          )}
        >
          {user.name}
        </span>
      )}
    </Link>
  );
};
