import { ReactNode } from "react";

import { Spinner } from "@/features/shared/components/ui/spinner";

import { UserForList } from "../types";
import { UserCard } from "./user-card";

type UserListProps<T extends UserForList> = {
  users: T[];
  isLoading?: boolean;
  noUsersMessage?: string;
  rightComponent?: (user: T) => ReactNode;
};

export function UserList<T extends UserForList>({
  users,
  isLoading,
  noUsersMessage = "No users found",
  rightComponent,
}: UserListProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} rightComponent={rightComponent} />
      ))}
      {isLoading && (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {!isLoading && users.length === 0 && (
        <div className="flex items-center justify-center">
          <p className="text-gray-500">{noUsersMessage}</p>
        </div>
      )}
    </div>
  );
}
