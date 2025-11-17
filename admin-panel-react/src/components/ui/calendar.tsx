"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium text-gray-900 dark:text-gray-100",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-gray-600 dark:text-gray-400 rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gray-100 dark:[&:has([aria-selected])]:bg-gray-800 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-indigo-600 dark:aria-selected:bg-indigo-500 aria-selected:text-white",
        day_range_end:
          "day-range-end aria-selected:bg-indigo-600 dark:aria-selected:bg-indigo-500 aria-selected:text-white",
        day_selected:
          "!bg-indigo-600 dark:!bg-indigo-500 !text-white hover:!bg-indigo-700 dark:hover:!bg-indigo-400 focus:!bg-indigo-600 dark:focus:!bg-indigo-500 font-semibold shadow-md ring-2 ring-indigo-300 dark:ring-indigo-700 ring-offset-1",
        day_today: "bg-blue-50 dark:bg-blue-950/30 text-gray-900 dark:text-gray-100 font-semibold border-2 border-blue-400 dark:border-blue-600 aria-selected:border-indigo-400 dark:aria-selected:border-indigo-500",
        day_outside:
          "day-outside text-gray-400 dark:text-gray-600 aria-selected:text-gray-400 dark:aria-selected:text-gray-600",
        day_disabled: "text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800 aria-selected:text-gray-900 dark:aria-selected:text-gray-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
