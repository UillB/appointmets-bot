import { Building2, Users, Wrench, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface OrganizationCardProps {
  id: string;
  name: string;
  logo?: string;
  usersCount: number;
  servicesCount: number;
  createdAt: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function OrganizationCard({
  id,
  name,
  logo,
  usersCount,
  servicesCount,
  createdAt,
  onView,
  onEdit,
}: OrganizationCardProps) {
  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-indigo-500",
      "bg-purple-500",
      "bg-blue-500",
      "bg-cyan-500",
      "bg-emerald-500",
      "bg-amber-500",
    ];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const avatarColor = getAvatarColor(name);
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="p-6 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={`w-12 h-12 rounded-lg ${avatarColor} flex items-center justify-center text-white flex-shrink-0`}
          >
            {logo ? (
              <img src={logo} alt={name} className="w-full h-full rounded-lg object-cover" />
            ) : (
              <span className="text-lg font-semibold">{initials}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {usersCount} {usersCount === 1 ? "User" : "Users"} • {servicesCount}{" "}
              {servicesCount === 1 ? "Service" : "Services"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>{usersCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>{servicesCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>{createdAt}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
            onClick={() => onView(id)}
          >
            <Building2 className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => onEdit(id)}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>
    </Card>
  );
}
