import { Building2, Users, Wrench, Calendar, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useLanguage } from "../../i18n";

interface OrganizationCardProps {
  id: string;
  name: string;
  logo?: string;
  usersCount: number;
  servicesCount: number;
  createdAt: string;
  isActive?: boolean;
  subscriptionPlan?: 'FREE' | 'PRO' | 'ENTERPRISE';
  userRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onSwitch?: (id: string) => void;
}

export function OrganizationCard({
  id,
  name,
  logo,
  usersCount,
  servicesCount,
  createdAt,
  isActive = false,
  subscriptionPlan,
  userRole,
  onView,
  onEdit,
  onSwitch,
}: OrganizationCardProps) {
  const { t } = useLanguage();
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
    <Card className={`p-6 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 ${
      isActive ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''
    }`}>
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
            <div className="flex items-center gap-2 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]" title={name}>
                    {name}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
              {isActive && (
                <Badge variant="default" className="bg-indigo-600 text-white text-xs">
                  {t('organizations.active')}
                </Badge>
              )}
              {subscriptionPlan && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    subscriptionPlan === 'PRO' ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300' :
                    subscriptionPlan === 'ENTERPRISE' ? 'border-purple-500 text-purple-700 dark:text-purple-300' :
                    'border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {subscriptionPlan}
                </Badge>
              )}
              {userRole && (
                <Badge variant="outline" className="text-xs border-gray-400 text-gray-600 dark:text-gray-400">
                  {t(`organizations.${userRole.toLowerCase()}`)}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {usersCount} {usersCount === 1 ? t('cards.organization.user') : t('cards.organization.users')} • {servicesCount}{" "}
              {servicesCount === 1 ? t('cards.organization.service') : t('cards.organization.services')}
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
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          {!isActive && onSwitch ? (
            // If switch is available, show it on a separate row
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 hover:text-indigo-700 dark:hover:text-indigo-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-200 font-medium"
                  onClick={() => onView(id)}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  {t('cards.organization.view')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 font-medium"
                  onClick={() => onEdit(id)}
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  {t('cards.organization.edit')}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 hover:text-emerald-700 dark:hover:text-emerald-200 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200 font-medium"
                onClick={() => onSwitch(id)}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                {t('organizations.switch')}
              </Button>
            </div>
          ) : (
            // If no switch needed, show View and Edit in one row
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 hover:text-indigo-700 dark:hover:text-indigo-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-200 font-medium"
                onClick={() => onView(id)}
              >
                <Building2 className="w-4 h-4 mr-2" />
                {t('cards.organization.view')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 font-medium"
                onClick={() => onEdit(id)}
              >
                <Wrench className="w-4 h-4 mr-2" />
                {t('cards.organization.edit')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
