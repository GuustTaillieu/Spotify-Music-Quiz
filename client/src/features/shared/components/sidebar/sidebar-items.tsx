import { useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/features/shared/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/features/shared/components/ui/sidebar";
import { SidebarItem, SidebarItemChild } from "@/lib/conststants/sidebar-items";

import { Link } from "../ui/link";

type SidebarItemsProps = {
  items: SidebarItem[];
};

export function SidebarItems({ items }: SidebarItemsProps) {
  const { location } = useRouterState();

  const isItemActive = (item: SidebarItemChild): boolean => {
    return location.pathname == item.url;
  };

  const isChildItemActive = (item: SidebarItem): boolean => {
    return item.items.some((subItem) => isItemActive(subItem));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={isChildItemActive(item)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem
                      key={subItem.title}
                      className={
                        isItemActive(subItem) ? "bg-sidebar-accent" : ""
                      }
                    >
                      <SidebarMenuSubButton asChild>
                        <Link className="hover:no-underline" href={subItem.url}>
                          {subItem.title}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
