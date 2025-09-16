import { sidebarItems } from "@/lib/conststants/sidebar-items";

type UseSidebarItemsProps =
  | {
      authenticated: "authenticated";
      variant: keyof (typeof sidebarItems)["unauthenticated"];
    }
  | {
      authenticated: "unauthenticated";
      variant: keyof (typeof sidebarItems)["authenticated"];
    };

export function useSidebarItems({
  authenticated,
  variant,
}: UseSidebarItemsProps) {
  if (authenticated === "authenticated") {
    return sidebarItems[authenticated][
      variant as keyof typeof sidebarItems.authenticated
    ];
  } else if (authenticated === "unauthenticated") {
    return sidebarItems[authenticated][
      variant as keyof typeof sidebarItems.unauthenticated
    ];
  }
}
