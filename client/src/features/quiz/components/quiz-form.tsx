import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Quiz } from "@music-quiz/server/database/schema";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { Button } from "@/features/shared/components/ui/button";
import { FileInput } from "@/features/shared/components/ui/file-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/features/shared/components/ui/form";
import { Input } from "@/features/shared/components/ui/input";
import { Switch } from "@/features/shared/components/ui/switch";

import { quizValidationSchema } from "../../../../../shared/schema/quiz";
import { useQuizMutations } from "../hooks/useQuizMutations";
import { QuizForEdit } from "../types";

type QuizFormData = z.infer<typeof quizValidationSchema>;

type QuizFormProps = {
  quiz?: QuizForEdit;
  onSuccess: (id: Quiz["id"]) => void;
  onCancel: (id?: Quiz["id"]) => void;
};

export const QuizForm = ({ quiz, onSuccess, onCancel }: QuizFormProps) => {
  const { editMutation, addMutation } = useQuizMutations({
    add: { onSuccess },
    edit: { onSuccess },
  });

  const mutation = quiz ? editMutation : addMutation;

  const form = useForm<QuizFormData>({
    resolver: standardSchemaResolver(quizValidationSchema),
    defaultValues: {
      id: quiz?.id ?? undefined,
      title: quiz?.title ?? "",
      public: quiz?.public ?? false,
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (!!value) {
        formData.append(key, value as string | Blob);
      }
    }

    mutation.mutate(formData);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <FileInput
                  accept="image/*"
                  onChange={(e) => field.onChange(e.target?.files?.[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="public"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormLabel>Public: </FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={mutation.isPending || !form.formState.isValid}
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancel(quiz?.id)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};
