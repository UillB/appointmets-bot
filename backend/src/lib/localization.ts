import { Lang } from "../i18n";

export interface LocalizedService {
  id: number;
  name: string;
  description?: string | null;
  durationMin: number;
}

export function getLocalizedServiceName(service: any, lang: Lang): string {
  switch (lang) {
    case "ru":
      return service.nameRu || service.name;
    case "en":
      return service.nameEn || service.name;
    case "he":
      return service.nameHe || service.name;
    default:
      return service.name;
  }
}

export function getLocalizedServiceDescription(service: any, lang: Lang): string | null {
  switch (lang) {
    case "ru":
      return service.descriptionRu || service.description;
    case "en":
      return service.descriptionEn || service.description;
    case "he":
      return service.descriptionHe || service.description;
    default:
      return service.description;
  }
}

