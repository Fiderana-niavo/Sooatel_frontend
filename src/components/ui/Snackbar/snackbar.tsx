import { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type SnackbarType = "success" | "error" | "info";

interface SnackbarUIProps {
  message: string;
  type: SnackbarType;
  onClose: () => void;
}

export function Snackbar({ message, type, onClose }: SnackbarUIProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case "success": return <CheckCircle className="size-5 text-emerald-500" />;
      case "error": return <AlertCircle className="size-5 text-destructive" />;
      default: return <Info className="size-5 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success": return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "error": return "bg-red-50 border-red-200 text-red-800";
      default: return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${getColors()} min-w-[300px] max-w-[400px]`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 text-sm font-semibold">
          {message}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-black/5"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
