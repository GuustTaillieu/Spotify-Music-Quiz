import { zodResolver } from "@hookform/resolvers/zod";
import {
  QuizFilterParams,
  quizFiltersSchema,
} from "@music-quiz/shared/schema/quiz";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/features/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/features/shared/components/ui/form";
import { Input } from "@/features/shared/components/ui/input";

type UserFiltersProps = {
  onFiltersChange: (filters: QuizFilterParams) => void;
  initialFilters: QuizFilterParams;
};

export const UserFilters = ({
  onFiltersChange,
  initialFilters,
}: UserFiltersProps) => {
  const form = useForm<QuizFilterParams>({
    defaultValues: initialFilters,
    resolver: zodResolver(quizFiltersSchema),
  });

  const handleSubmit = form.handleSubmit(({ q }) => {
    const filters: QuizFilterParams = {};
    if (q) filters.q = q?.trim() || undefined;

    onFiltersChange(filters);
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="q"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="search"
                    placeholder="Search quizzes..."
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          <Search className="size-4" />
          Search
        </Button>
      </form>
    </Form>
  );
};
