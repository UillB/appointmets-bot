import React, { useState, useEffect } from "react";
import { X, Building2, Mail, Phone, MapPin } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { apiClient, Organization } from "../../services/api";
import { toast } from "sonner";
import { StepIndicator } from "../StepIndicator";
import { useLanguage } from "../../i18n";

interface OrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: Organization | null;
  onSave: (data: any) => void;
  readOnly?: boolean; // If true, show in view-only mode
}

export function OrganizationDialog({
  open,
  onOpenChange,
  organization,
  onSave,
  readOnly = false,
}: OrganizationDialogProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    email: organization?.email || "",
    phone: organization?.phone || "",
    address: organization?.address || "",
    description: organization?.description || "",
  });

  // Update form data when organization changes
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        email: organization.email || "",
        phone: organization.phone || "",
        address: organization.address || "",
        description: organization.description || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        description: "",
      });
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit in view mode
    if (isViewMode) {
      return;
    }
    
    console.log('Organization form submitted!');
    
    try {
      if (!formData.name || !formData.name.trim()) {
        toast.error(t('dialogs.organization.nameRequired'));
        return;
      }

      const organizationData = {
        name: formData.name.trim(),
        description: formData.description || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      };

      if (organization) {
        await apiClient.updateOrganization(organization.id, organizationData);
        toast.success(t('dialogs.organization.updated'));
      } else {
        const result = await apiClient.createOrganization(organizationData);
        toast.success(t('dialogs.organization.created'));
      }

      onSave?.(organizationData);
      onOpenChange(false);
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        description: "",
      });
    } catch (error) {
      console.error('Organization save error:', error);
      toast.error(t('dialogs.organization.saveFailed'));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isEdit = !!organization;
  const isViewMode = readOnly && organization;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-lg flex flex-col h-screen bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
        <DrawerHeader className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl text-gray-900 dark:text-gray-100">
                  {isViewMode ? t('dialogs.organization.viewTitle') : isEdit ? t('dialogs.organization.editTitle') : t('dialogs.organization.createTitle')}
                </DrawerTitle>
                <DrawerDescription className="text-gray-600 dark:text-gray-400">
                  {isViewMode 
                    ? t('dialogs.organization.viewDescription')
                    : isEdit 
                    ? t('dialogs.organization.editDescription')
                    : t('dialogs.organization.createDescription')}
                </DrawerDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg border border-gray-300 dark:border-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {isViewMode ? (
              // View mode - no form, just display
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      {t('dialogs.organization.fields.organizationName')}
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-gray-100">{formData.name || t('common.notAvailable')}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      {t('dialogs.organization.fields.description')}
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[80px]">
                      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{formData.description || t('common.notAvailable')}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      {t('dialogs.organization.fields.email')}
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-gray-100">{formData.email || t('common.notAvailable')}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      {t('dialogs.organization.fields.phone')}
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-gray-100">{formData.phone || t('common.notAvailable')}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      {t('dialogs.organization.fields.address')}
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-gray-100">{formData.address || t('common.notAvailable')}</p>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenChange(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 text-base font-semibold"
                  >
                    {t('dialogs.close')}
                  </Button>
                </div>
              </div>
            ) : (
              // Edit/Create mode - with form
              <form onSubmit={handleSubmit} id="organization-form" className="space-y-2" noValidate>
              {!isEdit ? (
                <>
                  {/* Step 1: Basic Information */}
                  <StepIndicator
                    stepNumber={1}
                    title={t('dialogs.organization.step1.title')}
                    description={t('dialogs.organization.step1.description')}
                  />
                  <div className="pl-14 space-y-4 pb-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">
                        {t('dialogs.organization.fields.organizationName')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={t('dialogs.organization.placeholders.name')}
                          className="h-11 pl-10"
                          required
                          disabled={isViewMode}
                          readOnly={isViewMode}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm">
                        {t('dialogs.organization.fields.description')}
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder={t('dialogs.organization.placeholders.description')}
                        rows={3}
                        className="resize-none"
                        disabled={isViewMode}
                        readOnly={isViewMode}
                      />
                    </div>
                  </div>

                  {/* Step 2: Contact Information */}
                  <StepIndicator
                    stepNumber={2}
                    title={t('dialogs.organization.step2.title')}
                    description={t('dialogs.organization.step2.description')}
                    isLast={true}
                  />
                  <div className="pl-14 space-y-4 pb-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">
                        {t('dialogs.organization.fields.email')}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t('dialogs.organization.placeholders.email')}
                          className="h-11 pl-10"
                          disabled={isViewMode}
                          readOnly={isViewMode}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">
                        {t('dialogs.organization.fields.phone')}
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder={t('dialogs.organization.placeholders.phone')}
                          className="h-11 pl-10"
                          disabled={isViewMode}
                          readOnly={isViewMode}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm">
                        {t('dialogs.organization.fields.address')}
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder={t('dialogs.organization.placeholders.address')}
                          className="h-11 pl-10"
                          disabled={isViewMode}
                          readOnly={isViewMode}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('dialogs.organization.fields.organizationName')} *
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('dialogs.organization.placeholders.name')}
                        required
                        className="h-12 pl-10 text-base"
                        disabled={isViewMode}
                        readOnly={isViewMode}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('dialogs.organization.fields.description')}
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                        placeholder={t('dialogs.organization.placeholders.description')}
                      rows={3}
                      className="text-base"
                      disabled={isViewMode}
                      readOnly={isViewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('dialogs.organization.fields.email')}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('dialogs.organization.placeholders.email')}
                        className="h-12 pl-10 text-base"
                        disabled={isViewMode}
                        readOnly={isViewMode}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('dialogs.organization.fields.phone')}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={t('dialogs.organization.placeholders.phone')}
                        className="h-12 pl-10 text-base"
                        disabled={isViewMode}
                        readOnly={isViewMode}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('dialogs.organization.fields.address')}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder={t('dialogs.organization.placeholders.address')}
                        className="h-12 pl-10 text-base"
                        disabled={isViewMode}
                        readOnly={isViewMode}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit and Cancel buttons */}
              {!isViewMode && (
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 text-base font-semibold"
                  >
                    {isEdit ? t('dialogs.organization.saveChanges') : t('dialogs.organization.createOrganization')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 h-12 text-base font-semibold border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {t('dialogs.cancel')}
                  </Button>
                </div>
              )}
            </form>
          )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
