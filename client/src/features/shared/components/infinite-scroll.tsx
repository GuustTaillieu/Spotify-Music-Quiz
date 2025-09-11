import { useEffect, useRef } from "react";

type InfiniteScrollProps = {
  children: React.ReactNode;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  threshold?: number;
};

export const InfiniteScroll = ({
  children,
  onLoadMore,
  threshold = 500,
}: InfiniteScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) onLoadMore?.();
      },
      {
        rootMargin: `0px 0px ${threshold}px 0px`,
      },
    );
    const container = containerRef.current;
    if (container) observer.observe(container);

    return () => {
      if (container) observer.unobserve(container);
    };
  }, [onLoadMore, threshold]);

  return (
    <div>
      {children}
      <div className="h-1" ref={containerRef} />
    </div>
  );
};
