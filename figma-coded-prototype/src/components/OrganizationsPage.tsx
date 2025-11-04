import { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Download,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { OrganizationCard } from "./OrganizationCard";
import { OrganizationFormSheet } from "./OrganizationFormSheet";
import { PageTitle } from "./PageTitle";
import { toastNotifications } from "./toast-notifications";

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

interface OrganizationsPageProps {}

export function OrganizationsPage({}: OrganizationsPageProps) {
  const [organizations, setOrganizations] = useState(mockOrganizations);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  // Filter and sort organizations
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations.filter((org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
          const dateA = new Date(a.createdAt.split("/").reverse().join("-"));
          const dateB = new Date(b.createdAt.split("/").reverse().join("-"));
          return dateB.getTime() - dateA.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [organizations, searchQuery, sortBy]);

  const handleRefresh = () => {
    toast.success("Organizations refreshed");
  };

  const handleExport = () => {
    toast.success("Exporting organizations data...");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSortBy("name");
    toast.info("Filters cleared");
  };

  const handleView = (id: string) => {
    const org = organizations.find((o) => o.id === id);
    if (org) {
      toast.info(`Viewing ${org.name}`);
    }
  };

  const handleEdit = (id: string) => {
    const org = organizations.find((o) => o.id === id);
    setSelectedOrg(org || null);
    setDialogOpen(true);
  };

  const handleSave = (data: any) => {
    if (selectedOrg) {
      // Update existing
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === selectedOrg.id ? { ...org, ...data } : org
        )
      );
      toastNotifications.organizations.updated(data.name);
    } else {
      // Create new
      const newOrg = {
        id: String(organizations.length + 1),
        ...data,
        usersCount: 0,
        servicesCount: 0,
        createdAt: new Date().toLocaleDateString("en-GB"),
      };
      setOrganizations((prev) => [...prev, newOrg]);
      toastNotifications.organizations.created(data.name);
    }
    setSelectedOrg(null);
  };

  const hasFilters = searchQuery || sortBy !== "name";

  return (
    <div className="space-y-6">
      <PageTitle
        icon={<Building2 className="w-6 h-6 text-white" />}
        title="Organizations"
        description="Manage your organizations and their settings"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="hidden sm:flex"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="hidden sm:flex"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => {
                setSelectedOrg(null);
                setDialogOpen(true);
              }}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Organization
            </Button>
          </>
        }
      />

      {/* Filters Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">By Name</SelectItem>
                <SelectItem value="users">By Users</SelectItem>
                <SelectItem value="services">By Services</SelectItem>
                <SelectItem value="date">By Date</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div>
        {filteredOrganizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No organizations found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Get started by creating your first organization"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => {
                  setSelectedOrg(null);
                  setDialogOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Organization
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredOrganizations.map((org) => (
                <OrganizationCard
                  key={org.id}
                  id={org.id}
                  name={org.name}
                  usersCount={org.usersCount}
                  servicesCount={org.servicesCount}
                  createdAt={org.createdAt}
                  onView={handleView}
                  onEdit={handleEdit}
                />
              ))}
            </div>

            {/* Results Count */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-sm text-gray-600 text-center">
                Showing {filteredOrganizations.length} of {organizations.length} organizations
              </p>
            </div>
          </>
        )}
      </div>

      {/* Dialog */}
      <OrganizationFormSheet
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        organization={selectedOrg}
        onSave={handleSave}
      />
    </div>
  );
}