import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import { useToast } from "../hooks/useToast";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type ErrorComponentProps = {};

export const ErrorComponent = ({}: ErrorComponentProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleRetry = () => {
    router.invalidate();
    toast({
      title: "Retrying",
      description: "Please wait while we retry the request.",
      duration: 3000,
    });
  };

  return (
    <Card className="flex flex-col items-center justify-center gap-2">
      <AlertTriangle className="size-8" />
      <p>Something went wrong.</p>
      <Button variant="ghost" onClick={handleRetry}>
        <RefreshCcw className="size-4" />
        Try again
      </Button>
    </Card>
  );
};
