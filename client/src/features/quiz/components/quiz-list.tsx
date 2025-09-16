import { Spinner } from "@/features/shared/components/ui/spinner";

import { QuizForList } from "../types";
import { QuizCard } from "./quiz-card";

type QuizListProps = {
  quizes: QuizForList[];
  isLoading?: boolean;
  noQuizesMessage?: string;
};

const QuizList = ({
  quizes,
  isLoading,
  noQuizesMessage = "No quizes found",
}: QuizListProps) => {
  return (
    <div className="space-y-4">
      {quizes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {!isLoading && quizes.length === 0 && (
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold">{noQuizesMessage}</h1>
        </div>
      )}
    </div>
  );
};

export default QuizList;
