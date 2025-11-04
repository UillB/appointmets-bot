interface StepIndicatorProps {
  stepNumber: number;
  title: string;
  description?: string;
  isLast?: boolean;
}

export function StepIndicator({
  stepNumber,
  title,
  description,
  isLast = false,
}: StepIndicatorProps) {
  return (
    <div className="flex gap-4">
      {/* Step Number Badge */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold">{stepNumber}</span>
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-indigo-200 mt-2 min-h-[24px]" />
        )}
      </div>

      {/* Step Content */}
      <div className="flex-1 pb-6">
        <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
}

