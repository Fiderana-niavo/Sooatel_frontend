import React, { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  onLoadMoreTop?: () => void;
  onLoadMoreBottom?: () => void;
  hasMoreTop?: boolean;
  hasMoreBottom?: boolean;
  isLoadingTop?: boolean;
  isLoadingBottom?: boolean;
  children: React.ReactNode;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  onLoadMoreTop,
  onLoadMoreBottom,
  hasMoreTop,
  hasMoreBottom,
  isLoadingTop,
  isLoadingBottom,
  children
}) => {
  const topObserverRef = useRef<HTMLDivElement>(null);
  const bottomObserverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const topEntry = entries.find(e => e.target === topObserverRef.current);
        const bottomEntry = entries.find(e => e.target === bottomObserverRef.current);

        if (topEntry?.isIntersecting && hasMoreTop && !isLoadingTop && onLoadMoreTop) {
          onLoadMoreTop();
        }

        if (bottomEntry?.isIntersecting && hasMoreBottom && !isLoadingBottom && onLoadMoreBottom) {
          onLoadMoreBottom();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    if (topObserverRef.current) observer.observe(topObserverRef.current);
    if (bottomObserverRef.current) observer.observe(bottomObserverRef.current);

    return () => observer.disconnect();
  }, [hasMoreTop, hasMoreBottom, isLoadingTop, isLoadingBottom, onLoadMoreTop, onLoadMoreBottom]);

  return (
    <div className="flex flex-col relative w-full h-full">
      {hasMoreTop && (
        <div ref={topObserverRef} className="w-full py-4 flex justify-center items-center">
          {isLoadingTop && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
        </div>
      )}

      {children}

      {hasMoreBottom && (
        <div ref={bottomObserverRef} className="w-full py-4 flex justify-center items-center">
          {isLoadingBottom && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
        </div>
      )}
    </div>
  );
};

