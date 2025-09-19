import { ReactNode } from "react";

import { Card } from "@/features/shared/components/ui/card";

import { UserForList } from "../types";
import { UserAvatar } from "./user-avatar";

type UserCardProps<T extends UserForList> = {
  user: T;
  rightComponent?: (user: T) => ReactNode;
};

export function UserCard<T extends UserForList>({
  user,
  rightComponent,
}: UserCardProps<T>) {
  return (
    <Card className="flex items-center justify-between">
      <UserAvatar user={user} canGoToUserPage />
      {rightComponent && rightComponent(user)}
    </Card>
  );
}
