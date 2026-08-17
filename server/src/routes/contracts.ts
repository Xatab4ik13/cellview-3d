import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const contractsRouter = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/kladovka78/uploads';

function fmtDate(value: any): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('ru-RU');
}

function fmtNum(value: any, digits = 2): string {
  const n = Number(value);
  if (isNaN(n)) return '—';
  return n.toLocaleString('ru-RU', { maximumFractionDigits: digits });
}

async function getTemplatePath(): Promise<{ filePath: string; fileName: string }> {
  const [rows] = await pool.query(
    `SELECT setting_value FROM site_settings WHERE setting_key = 'contract_template' LIMIT 1`
  );
  const raw = (rows as any[])[0]?.setting_value;
  if (!raw) throw new AppError('Шаблон договора не загружен в CRM (Сайт → Шаблон договора)', 404);

  let tpl: any = {};
  try { tpl = JSON.parse(raw); } catch { throw new AppError('Некорректный шаблон договора', 500); }
  if (!tpl?.url) throw new AppError('Шаблон договора не загружен', 404);

  const relative = String(tpl.url).replace(/^https?:\/\/[^/]+/, '');
  if (!relative.startsWith('/uploads/')) throw new AppError('Шаблон договора должен быть загружен файлом', 400);
  const filePath = path.join(UPLOAD_DIR, relative.replace('/uploads/', ''));
  if (!fs.existsSync(filePath)) throw new AppError('Файл шаблона договора не найден на сервере', 404);
  if (path.extname(filePath).toLowerCase() !== '.docx') {
    throw new AppError('Шаблон договора должен быть в формате .docx', 400);
  }
  return { filePath, fileName: tpl.name || 'contract.docx' };
}

// GET /api/contracts/rental/:id — сформировать договор по шаблону
contractsRouter.get('/rental/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         r.id, r.start_date, r.end_date, r.duration_months, r.monthly_price, r.total_amount, r.discount_percent,
         c.number AS cell_number, c.volume, c.area, c.width, c.height, c.depth, c.tier,
         cu.name AS customer_name, cu.phone, cu.email, cu.type,
         cu.passport_series, cu.passport_number, cu.passport_issued, cu.passport_date,
         cu.birth_date, cu.birth_place, cu.registration_address,
         cu.company_name, cu.inn, cu.ogrn, cu.kpp, cu.legal_address
       FROM rentals r
       JOIN cells c ON c.id = r.cell_id
       JOIN customers cu ON cu.id = r.customer_id
       WHERE r.id = ? LIMIT 1`,
      [req.params.id]
    );
    const r = (rows as any[])[0];
    if (!r) throw new AppError('Аренда не найдена', 404);

    const { filePath } = await getTemplatePath();
    const content = fs.readFileSync(filePath);
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' },
      nullGetter: () => '—',
    });

    const data: Record<string, string> = {
      номер_договора: String(r.id).slice(0, 8).toUpperCase(),
      дата_договора: fmtDate(new Date()),
      номер_ячейки: String(r.cell_number),
      объём: fmtNum(r.volume),
      объем: fmtNum(r.volume),
      площадь: fmtNum(r.area),
      ширина: fmtNum(r.width),
      высота: fmtNum(r.height),
      глубина: fmtNum(r.depth),
      ярус: String(r.tier ?? 1),
      срок_месяцев: String(r.duration_months ?? ''),
      дата_начала: fmtDate(r.start_date),
      дата_окончания: fmtDate(r.end_date),
      цена_за_месяц: fmtNum(r.monthly_price, 0),
      сумма: fmtNum(r.total_amount, 0),
      скидка: String(r.discount_percent ?? 0),
      клиент: r.customer_name || '',
      фио: r.customer_name || '',
      телефон: r.phone || '',
      email: r.email || '',
      паспорт_серия: r.passport_series || '',
      паспорт_номер: r.passport_number || '',
      паспорт_выдан: r.passport_issued || '',
      паспорт_дата: r.passport_date || '',
      дата_рождения: r.birth_date || '',
      место_рождения: r.birth_place || '',
      адрес_регистрации: r.registration_address || '',
      организация: r.company_name || '',
      инн: r.inn || '',
      огрн: r.ogrn || '',
      кпп: r.kpp || '',
      юридический_адрес: r.legal_address || '',
    };

    doc.render(data);
    const buffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });

    const outName = `Договор_ячейка_${r.cell_number}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="contract-cell-${r.cell_number}.docx"; filename*=UTF-8''${encodeURIComponent(outName)}`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});
