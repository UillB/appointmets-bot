import { useTheme } from "../hooks/useTheme";

export function ThemeLoader() {
  const { isThemeChanging } = useTheme();

  if (!isThemeChanging) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          Switching theme...
        </p>
      </div>
    </div>
  );
}

