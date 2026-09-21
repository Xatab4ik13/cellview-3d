import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { buildDocx, DocxParagraph } from '../utils/simpleDocx';

export const contractsRouter = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/kladovka78/uploads';

const LESSOR = {
  name: 'ИП Пушкина Евгения Николаевна',
  inn: '780529368973',
  address: 'г. Санкт-Петербург, ул. Алтайская, д. 21, пом. 22-Н',
  phone: '8 (911) 810-83-83',
};

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

async function getTemplatePath(): Promise<{ filePath: string; fileName: string } | null> {
  const [rows] = await pool.query(
    `SELECT setting_value FROM site_settings WHERE setting_key = 'contract_template' LIMIT 1`
  );
  const raw = (rows as any[])[0]?.setting_value;
  if (!raw) return null;

  let tpl: any = {};
  try { tpl = JSON.parse(raw); } catch { return null; }
  if (!tpl?.url) return null;

  const relative = String(tpl.url).replace(/^https?:\/\/[^/]+/, '');
  if (!relative.startsWith('/uploads/')) return null;
  const filePath = path.join(UPLOAD_DIR, relative.replace('/uploads/', ''));
  if (!fs.existsSync(filePath)) return null;
  if (path.extname(filePath).toLowerCase() !== '.docx') return null;
  return { filePath, fileName: tpl.name || 'contract.docx' };
}

/** Встроенный договор — используется, если свой шаблон .docx не загружен в CRM. */
function buildDefaultContract(d: Record<string, string>): Buffer {
  const P = (text: string, extra: Partial<DocxParagraph> = {}): DocxParagraph => ({ text, ...extra });
  const isCompany = !!d.организация;
  const tenantBlock = isCompany
    ? `${d.организация}, ИНН ${d.инн || '—'}, ОГРН ${d.огрн || '—'}, КПП ${d.кпп || '—'}, адрес: ${d.юридический_адрес || '—'}, в лице ${d.фио || '—'}`
    : `${d.фио || '—'}, паспорт ${d.паспорт_серия || '—'} ${d.паспорт_номер || '—'}, выдан ${d.паспорт_выдан || '—'} ${d.паспорт_дата || ''}, дата рождения ${d.дата_рождения || '—'}, адрес регистрации: ${d.адрес_регистрации || '—'}`;

  return buildDocx([
    P(`ДОГОВОР АРЕНДЫ ИНДИВИДУАЛЬНОЙ КЛАДОВОЙ № ${d.номер_договора}`, { bold: true, align: 'center', size: 26 }),
    P(`г. Санкт-Петербург                                        ${d.дата_договора}`, { align: 'center' }),
    P(''),
    P(`${LESSOR.name}, ИНН ${LESSOR.inn}, адрес: ${LESSOR.address} (далее — «Арендодатель»), и ${tenantBlock} (далее — «Арендатор»), заключили настоящий договор о нижеследующем.`),
    P(''),
    P('1. ПРЕДМЕТ ДОГОВОРА', { bold: true, align: 'left' }),
    P(`1.1. Арендодатель передаёт Арендатору во временное пользование индивидуальную кладовую (ячейку) № ${d.номер_ячейки}, расположенную по адресу: ${LESSOR.address}.`),
    P(`1.2. Характеристики ячейки: объём ${d.объём} м³, площадь ${d.площадь} м², габариты ${d.ширина} × ${d.глубина} × ${d.высота} м, ярус ${d.ярус}.`),
    P('1.3. Ячейка передаётся для хранения имущества Арендатора, не относящегося к запрещённым к хранению вещам (п. 4 договора).'),
    P(''),
    P('2. СРОК АРЕНДЫ', { bold: true, align: 'left' }),
    P(`2.1. Срок аренды: ${d.срок_месяцев} мес., с ${d.дата_начала} по ${d.дата_окончания}.`),
    P('2.2. Договор может быть продлён Арендатором путём оплаты следующего периода в личном кабинете на сайте kladovka78.ru.'),
    P(''),
    P('3. СТОИМОСТЬ И ПОРЯДОК ОПЛАТЫ', { bold: true, align: 'left' }),
    P(`3.1. Стоимость аренды составляет ${d.цена_за_месяц} руб. в месяц.`),
    P(`3.2. Общая сумма за период аренды: ${d.сумма} руб. Применённая скидка: ${d.скидка} %.`),
    P('3.3. Оплата производится авансом за весь период аренды. Договор считается заключённым с момента поступления оплаты.'),
    P('3.4. При досрочном расторжении по инициативе Арендатора внесённая оплата за неиспользованный период не возвращается, если иное не согласовано сторонами.'),
    P(''),
    P('4. ПРАВА И ОБЯЗАННОСТИ СТОРОН', { bold: true, align: 'left' }),
    P('4.1. Арендодатель обеспечивает круглосуточный доступ Арендатора к ячейке, видеонаблюдение и охрану помещения склада.'),
    P('4.2. Арендатор обязуется использовать ячейку по назначению, содержать её в чистоте, не передавать доступ третьим лицам без уведомления Арендодателя.'),
    P('4.3. Запрещено хранение: оружия, боеприпасов, взрывчатых, легковоспламеняющихся, радиоактивных, наркотических, токсичных и сильно пахнущих веществ, продуктов питания, животных и растений, а также имущества, оборот которого ограничен законом.'),
    P('4.4. Арендодатель не несёт ответственности за имущество, хранение которого запрещено п. 4.3, и за естественную порчу имущества Арендатора.'),
    P(''),
    P('5. ДОСТУП', { bond: undefined as any, bold: true, align: 'left' }),
    P(`5.1. Доступ на склад осуществляется по звонку на номер ${LESSOR.phone} — дверь открывается автоматически при звонке с номера, указанного Арендатором: ${d.телефон || '—'}.`),
    P(''),
    P('6. ОТВЕТСТВЕННОСТЬ И РАСТОРЖЕНИЕ', { bold: true, align: 'left' }),
    P('6.1. При просрочке оплаты более 10 календарных дней Арендодатель вправе ограничить доступ к ячейке, а при просрочке более 30 дней — расторгнуть договор в одностороннем порядке.'),
    P('6.2. Все споры разрешаются путём переговоров, а при недостижении согласия — в суде по месту нахождения Арендодателя.'),
    P(''),
    P('7. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН', { bold: true, align: 'left' }),
    P(`Арендодатель: ${LESSOR.name}, ИНН ${LESSOR.inn}, ${LESSOR.address}, тел. ${LESSOR.phone}`),
    P(`Арендатор: ${isCompany ? d.организация : d.фио}, тел. ${d.телефон || '—'}, e-mail: ${d.email || '—'}`),
    P(''),
    P('Арендодатель _______________________               Арендатор _______________________', { align: 'left' }),
  ]);
}

// GET /api/contracts/rental/:id — сформировать договор аренды
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
      паспорт_дата: r.passport_date ? fmtDate(r.passport_date) : '',
      дата_рождения: r.birth_date ? fmtDate(r.birth_date) : '',
      место_рождения: r.birth_place || '',
      адрес_регистрации: r.registration_address || '',
      организация: r.company_name || '',
      инн: r.inn || '',
      огрн: r.ogrn || '',
      кпп: r.kpp || '',
      юридический_адрес: r.legal_address || '',
    };

    const tpl = await getTemplatePath();
    let buffer: Buffer;

    if (tpl) {
      const content = fs.readFileSync(tpl.filePath);
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' },
        nullGetter: () => '—',
      });
      doc.render(data);
      buffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' }) as Buffer;
    } else {
      buffer = buildDefaultContract(data);
    }

    const outName = `Договор_ячейка_${r.cell_number}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="contract-cell-${r.cell_number}.docx"; filename*=UTF-8''${encodeURIComponent(outName)}`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});
