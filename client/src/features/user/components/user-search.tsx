import { LocalUser } from "@music-quiz/server/database/schema";
import { useEffect, useState } from "react";

import { RawInput } from "@/features/shared/components/ui/input";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { trpc } from "@/router";

type UserSearchFieldProps = {
  onSearch: (users: LocalUser[]) => void;
};

export const UserSearch = ({ onSearch }: UserSearchFieldProps) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const userSearchQuery = trpc.users.search.useQuery(
    { q: debouncedSearch },
    { enabled: debouncedSearch.length > 0 },
  );

  useEffect(() => {
    if (userSearchQuery.data) {
      onSearch(userSearchQuery.data.users);
    }
  }, [userSearchQuery.data, onSearch]);

  return (
    <RawInput
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search users..."
    />
  );
};
