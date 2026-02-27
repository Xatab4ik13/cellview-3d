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
    title: 'Стандартные условия аренды кладовой',
    description: 'Стандартные условия предоставления индивидуальной кладовой — приложение к договору аренды',
    icon: 'FileText',
    type: 'DOCX',
    isPublished: true,
    updatedAt: '2025-02-27',
    fileUrl: '/docs/standard-conditions.docx',
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
    description: 'Порядок обработки и защиты персональных данных клиентов (152-ФЗ)',
    icon: 'Shield',
    type: 'Страница',
    isPublished: true,
    updatedAt: '2026-02-27',
    fileUrl: '/privacy',
  },
  {
    id: 'doc-5',
    title: 'Согласие на обработку персональных данных',
    description: 'Условия и порядок обработки персональных данных при использовании сайта',
    icon: 'ClipboardList',
    type: 'Страница',
    isPublished: true,
    updatedAt: '2026-02-27',
    fileUrl: '/consent',
  },
];
