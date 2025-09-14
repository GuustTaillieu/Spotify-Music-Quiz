import { Quiz, User } from "@music-quiz/server/database/schema";
import { ChevronsUpDown, Eye, EyeOff, LoaderIcon, Plus } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/features/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/features/shared/components/ui/sidebar";
import { router, trpc } from "@/router";

type QuizSwitcherProps = {
  user: User;
};

export function QuizSwitcher({ user }: QuizSwitcherProps) {
  const { data, ...quizesQuery } = trpc.quiz.byUserId.useInfiniteQuery(
    { userId: user.id },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const quizes = data?.pages.flatMap((page) => page.quizes);

  const loadMore = () => quizesQuery.fetchNextPage();

  if (quizesQuery.isLoading) return <QuizSwitcherLoading />;
  else if (quizes?.length === 0 || !quizes) return <QuizSwitcherNoQuizes />;
  else return <QuizSwitcherLoaded quizes={quizes} loadMore={loadMore} />;
}

type QuizSwitcherLoadingProps = {};

function QuizSwitcherLoading({}: QuizSwitcherLoadingProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
          onClick={() => router.navigate({ to: "/quiz/create" })}
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <LoaderIcon className="h-8 w-8 rounded-lg" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Loading...</span>
            <span className="truncate text-xs">
              Please wait while we load your quizes
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

type QuizSwitcherNoQuizesProps = {};

function QuizSwitcherNoQuizes({}: QuizSwitcherNoQuizesProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
          onClick={() => router.navigate({ to: "/quiz/create" })}
        >
          <div className="bg-accent/20 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Plus className="text-accent-foreground size-6 rounded-lg" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">No quizes yet</span>
            <span className="truncate text-xs">
              Click here to create your first!
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

type QuizSwitcherLoadedProps = {
  quizes: Quiz[];
  loadMore: () => void;
};

function QuizSwitcherLoaded({ quizes }: QuizSwitcherLoadedProps) {
  const { isMobile } = useSidebar();
  const [activeQuiz, setActiveQuiz] = useState(quizes?.[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {activeQuiz.public ? <Eye /> : <EyeOff />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeQuiz.title}</span>
                <span className="truncate text-xs">Ready to play</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Quizes
            </DropdownMenuLabel>

            {quizes.map((quiz, index) => (
              <DropdownMenuItem
                key={quiz.title}
                onClick={() => setActiveQuiz(quiz)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {quiz.public ? <Eye /> : <EyeOff />}
                </div>
                {quiz.title}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
