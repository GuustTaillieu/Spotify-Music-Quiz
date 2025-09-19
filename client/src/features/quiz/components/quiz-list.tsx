import { Spinner } from "@/features/shared/components/ui/spinner";

import { QuizForList } from "../types";
import { QuizCard } from "./quiz-card";

type QuizListProps = {
  quizzes: QuizForList[];
  isLoading?: boolean;
  noQuizzesMessage?: string;
};

const QuizList = ({
  quizzes,
  isLoading,
  noQuizzesMessage = "No quizzes found",
}: QuizListProps) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {!isLoading && quizzes.length === 0 && (
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold">{noQuizzesMessage}</h1>
        </div>
      )}
    </div>
  );
};

export default QuizList;
