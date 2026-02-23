import { FileText, ClipboardList, Scale, Shield } from 'lucide-react';

export interface SiteDocument {
  id: string;
  title: string;
  description: string;
  icon: string; // icon key
  type: string;
  isPublished: boolean;
  updatedAt: string;
  fileUrl?: string; // URL to downloadable file
}

export const iconMap: Record<string, React.ElementType> = {
  FileText,
  ClipboardList,
  Scale,
  Shield,
};

export const defaultDocuments: SiteDocument[] = [
  {
    id: 'doc-1',
    title: 'Договор аренды ячейки',
    description: 'Типовой договор аренды складской ячейки для физических и юридических лиц',
    icon: 'FileText',
    type: 'PDF',
    isPublished: true,
    updatedAt: '2025-01-15',
  },
  {
    id: 'doc-2',
    title: 'Акт приёма-передачи',
    description: 'Акт приёма-передачи ячейки при заключении и расторжении договора',
    icon: 'ClipboardList',
    type: 'PDF',
    isPublished: true,
    updatedAt: '2025-01-15',
  },
  {
    id: 'doc-3',
    title: 'Правила пользования складом',
    description: 'Правила поведения, режим работы и ограничения по хранению',
    icon: 'Scale',
    type: 'PDF',
    isPublished: true,
    updatedAt: '2025-02-01',
  },
  {
    id: 'doc-4',
    title: 'Политика конфиденциальности',
    description: 'Порядок обработки и защиты персональных данных клиентов',
    icon: 'Shield',
    type: 'PDF',
    isPublished: true,
    updatedAt: '2025-02-01',
  },
];
