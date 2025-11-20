import React, { useState, useMemo, useEffect } from "react";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Download,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { OrganizationCard } from "../cards/OrganizationCard";
import { OrganizationDialog } from "../dialogs/OrganizationDialog";
import { PageHeader } from "../PageHeader";
import { PageTitle } from "../PageTitle";
import { toast } from "sonner";
import { apiClient, Organization } from "../../services/api";
import { useLanguage } from "../../i18n";

// Mock data
const mockOrganizations = [
  {
    id: "1",
    name: "Demo Org",
    email: "demo@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, New York, USA",
    description: "Demo organization for testing purposes",
    usersCount: 1,
    servicesCount: 3,
    createdAt: "19/10/2025",
  },
  {
    id: "2",
    name: "Tech Solutions Inc",
    email: "contact@techsolutions.com",
    phone: "+1 (555) 987-6543",
    address: "456 Tech Avenue, San Francisco, USA",
    description: "Leading technology solutions provider",
    usersCount: 15,
    servicesCount: 8,
    createdAt: "15/09/2025",
  },
  {
    id: "3",
    name: "Health Care Plus",
    email: "info@healthcareplus.com",
    phone: "+1 (555) 456-7890",
    address: "789 Medical Drive, Boston, USA",
    description: "Professional healthcare services",
    usersCount: 25,
    servicesCount: 12,
    createdAt: "01/08/2025",
  },
  {
    id: "4",
    name: "Creative Studio",
    email: "hello@creativestudio.com",
    phone: "+1 (555) 321-0987",
    address: "321 Design Street, Los Angeles, USA",
    description: "Creative design and branding agency",
    usersCount: 8,
    servicesCount: 5,
    createdAt: "10/07/2025",
  },
];

type SortOption = "name" | "users" | "services" | "date";

export function OrganizationsPage() {
  const { t } = useLanguage();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const organizationsData = await apiClient.getOrganizations();
      setOrganizations(organizationsData.organizations);
    } catch (error) {
      console.error('Failed to load organizations data:', error);
      toast.error(t('toasts.failedToLoadOrganizations'));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort organizations
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations?.filter((org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "users":
          return b.usersCount - a.usersCount;
        case "services":
          return b.servicesCount - a.servicesCount;
        case "date":
          // Parse date and sort
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [organizations, searchQuery, sortBy]);

  const handleRefresh = () => {
    loadData();
    toast.success(t('toasts.organizationsRefreshed'));
  };


  const handleClearFilters = () => {
    setSearchQuery("");
    setSortBy("name");
    toast.info(t('toasts.filtersCleared'));
  };

  const handleView = (id: string) => {
    const org = organizations.find((o) => o.id.toString() === id);
    if (org) {
      setSelectedOrg(org);
      setIsViewMode(true);
      setDialogOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    const org = organizations.find((o) => o.id.toString() === id);
    if (org) {
      setSelectedOrg(org);
      setIsViewMode(false);
      setDialogOpen(true);
    }
  };

  const handleSave = async (data: any) => {
    try {
      // Reload data to get fresh data from backend
      await loadData();
      setSelectedOrg(null);
      setIsViewMode(false);
    } catch (error) {
      console.error('Failed to save organization:', error);
      toast.error(t('toasts.failedToSaveOrganization'));
    }
  };

  const hasFilters = searchQuery || sortBy !== "name";

  // Show loading state before rendering content
  // Wait until organizations array is initialized (even if empty)
  if (isLoading || organizations === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)] bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6" style={{ animation: 'none', transition: 'none' }}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Title */}
          <PageTitle
            icon={<Building2 className="w-6 h-6 text-white" />}
            title={t('organizations.title')}
            description={t('organizations.description')}
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="hidden sm:flex"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('organizations.refresh')}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedOrg(null);
                    setIsViewMode(false);
                    setDialogOpen(true);
                  }}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('organizations.newOrganization')}
                </Button>
              </>
            }
          />
          
          {/* Filters */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder={t('organizations.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder={t('organizations.sortBy')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <SelectItem value="name" className="text-gray-900 dark:text-gray-100">{t('organizations.sortByName')}</SelectItem>
                <SelectItem value="users" className="text-gray-900 dark:text-gray-100">{t('organizations.sortByUsers')}</SelectItem>
                <SelectItem value="services" className="text-gray-900 dark:text-gray-100">{t('organizations.sortByServices')}</SelectItem>
                <SelectItem value="date" className="text-gray-900 dark:text-gray-100">{t('organizations.sortByDate')}</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                {t('organizations.clearFilters')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="sm:hidden flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex-1 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('organizations.refresh')}
        </Button>
      </div>

      {/* Organizations Grid */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 px-4 sm:px-6 py-6">
        {filteredOrganizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-gray-900 dark:text-gray-100 mb-2">{t('organizations.noOrganizationsFound')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery
                ? t('organizations.tryAdjustingSearch')
                : t('organizations.getStarted')}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => {
                  setSelectedOrg(null);
                  setIsViewMode(false);
                  setDialogOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('organizations.newOrganization')}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredOrganizations.map((org) => {
                      const OrganizationCardComponent = () => (
                        <OrganizationCard
                          id={org.id.toString()}
                          name={org.name}
                          usersCount={0} // TODO: Get actual user count
                          servicesCount={0} // TODO: Get actual services count
                          createdAt={new Date(org.createdAt).toLocaleDateString()}
                          onView={handleView}
                          onEdit={handleEdit}
                        />
                      );
                      return <OrganizationCardComponent key={org.id} />;
                    })}
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredOrganizations.length > 0 && (
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {t('organizations.showing', { count: filteredOrganizations.length.toString(), total: organizations.length.toString() })}
          </p>
        </div>
      )}

          {/* Dialog */}
          <OrganizationDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setSelectedOrg(null);
                setIsViewMode(false);
              }
            }}
            organization={selectedOrg}
            onSave={handleSave}
            readOnly={isViewMode}
          />
        </div>
      </div>
    </div>
  );
}