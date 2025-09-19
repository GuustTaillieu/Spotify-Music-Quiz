import { Quiz, User } from "@music-quiz/server/database/schema";
import {
  ChevronsUpDown,
  Eye,
  EyeOff,
  LoaderIcon,
  Play,
  Plus,
} from "lucide-react";
import { ComponentProps, useState } from "react";

import { Button } from "@/features/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/features/shared/components/ui/sidebar";
import { cn } from "@/lib/utils/cn";
import { router, trpc } from "@/router";

type QuizSwitcherProps = {
  user: User;
} & ComponentProps<typeof SidebarMenuButton>;

export function QuizSwitcher({ user, ...props }: QuizSwitcherProps) {
  const [{ pages }, quizzesQuery] = trpc.quiz.byUserId.useSuspenseInfiniteQuery(
    { userId: user.id },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const quizzes = pages.flatMap((page) => page.quizzes);

  const loadMore = () => quizzesQuery.fetchNextPage();

  if (quizzesQuery.isLoading) {
    return <QuizSwitcherLoading {...props} />;
  } else if (quizzes.length === 0 || !quizzes) {
    return <QuizSwitcherNoQuizzes {...props} />;
  } else {
    return (
      <QuizSwitcherLoaded
        quizzes={quizzes}
        loadMore={loadMore}
        canLoadMore={quizzesQuery.hasNextPage}
        {...props}
      />
    );
  }
}

type QuizSwitcherLoadedProps = Omit<QuizSwitcherProps, "user"> & {
  quizzes: Quiz[];
  canLoadMore: boolean;
  loadMore: () => void;
};

function QuizSwitcherLoaded({
  quizzes,
  canLoadMore,
  loadMore,
  className,
  ...props
}: QuizSwitcherLoadedProps) {
  const { isMobile } = useSidebar();
  const [activeQuiz, setActiveQuiz] = useState(quizzes?.[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                className,
              )}
              {...props}
            >
              <div className="bg-accent text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
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
              Quizzes
            </DropdownMenuLabel>

            {quizzes.map((quiz) => (
              <DropdownMenuItem
                key={quiz.title}
                onClick={() => setActiveQuiz(quiz)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {quiz.public ? <Eye /> : <EyeOff />}
                </div>
                <span className="truncate">{quiz.title}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto aspect-square h-5"
                  onClick={
                    () => console.log("play", activeQuiz.id)
                    // TODO: start a game of the quiz
                  }
                >
                  <Play className="size-2" />
                </Button>
              </DropdownMenuItem>
            ))}
            {canLoadMore && (
              <Button variant="link" onClick={loadMore}>
                Load more
              </Button>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Create quiz
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

type QuizSwitcherLoadingProps = Omit<QuizSwitcherProps, "user">;

function QuizSwitcherLoading({
  className,
  ...props
}: QuizSwitcherLoadingProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className={cn(
            "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer",
            className,
          )}
          onClick={() => router.navigate({ to: "/quiz/create" })}
          {...props}
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <LoaderIcon className="h-8 w-8 rounded-lg" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Loading...</span>
            <span className="truncate text-xs">
              Please wait while we load your quizzes
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

type QuizSwitcherNoQuizzesProps = Omit<QuizSwitcherProps, "user">;

function QuizSwitcherNoQuizzes({
  className,
  ...props
}: QuizSwitcherNoQuizzesProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className={cn(
            "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer",
            className,
          )}
          onClick={() => router.navigate({ to: "/quiz/create" })}
          {...props}
        >
          <div className="bg-accent/20 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Plus className="text-accent-foreground size-6 rounded-lg" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">No quizzes yet</span>
            <span className="truncate text-xs">
              Click here to create your first!
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
