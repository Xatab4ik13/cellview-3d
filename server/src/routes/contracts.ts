import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export const contractsRouter = Router();

interface ContractData {
  contractNumber: string;
  contractDate: string;
  // Арендодатель
  landlordName: string;
  landlordInn: string;
  // Арендатор — физ. лицо
  tenantName: string;
  tenantPassportSeries: string;
  tenantPassportNumber: string;
  tenantPassportIssued: string;
  tenantPassportDate: string;
  tenantPassportCode: string;
  tenantBirthDate: string;
  tenantBirthPlace: string;
  tenantRegistrationAddress: string;
  tenantPhone: string;
  tenantEmail: string;
  // Арендатор — юр. лицо
  tenantCompanyName?: string;
  tenantInn?: string;
  tenantOgrn?: string;
  tenantKpp?: string;
  tenantLegalAddress?: string;
  tenantContactPerson?: string;
  // Ячейка
  cellNumber: number;
  cellWidth: number;
  cellDepth: number;
  cellHeight: number;
  cellArea: number;
  cellVolume: number;
  cellTier: number;
  // Аренда
  startDate: string;
  endDate: string;
  months: number;
  pricePerMonth: number;
  totalAmount: number;
  // Тип
  tenantType: 'individual' | 'company';
}

function formatDateRu(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
}

function generateContractNumber(rentalId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const short = rentalId.slice(0, 6).toUpperCase();
  return `К78-${year}${month}-${short}`;
}

async function buildContractPdf(data: ContractData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    // Register fonts
    const fontDir = path.join(__dirname, '..', 'fonts');
    const hasCustomFonts = fs.existsSync(path.join(fontDir, 'DejaVuSans.ttf'));

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      info: {
        Title: `Договор аренды №${data.contractNumber}`,
        Author: 'Кладовка78',
      },
    });

    if (hasCustomFonts) {
      doc.registerFont('Regular', path.join(fontDir, 'DejaVuSans.ttf'));
      doc.registerFont('Bold', path.join(fontDir, 'DejaVuSans-Bold.ttf'));
    } else {
      doc.registerFont('Regular', 'Helvetica');
      doc.registerFont('Bold', 'Helvetica-Bold');
    }

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 120; // margins

    // Title
    doc.font('Bold').fontSize(14).text(
      `ДОГОВОР АРЕНДЫ ИНДИВИДУАЛЬНОЙ КЛАДОВОЙ`,
      { align: 'center' }
    );
    doc.moveDown(0.3);
    doc.font('Bold').fontSize(12).text(
      `№ ${data.contractNumber}`,
      { align: 'center' }
    );

    doc.moveDown(1);

    // Date & city
    doc.font('Regular').fontSize(10);
    const dateCity = `г. Санкт-Петербург`;
    const dateText = formatDateRu(data.contractDate);
    doc.text(dateCity, 60, doc.y, { continued: false });
    doc.text(dateText, 60, doc.y - 14.5, { align: 'right' });

    doc.moveDown(1);

    // Parties
    doc.font('Regular').fontSize(10);

    const landlordText = `Индивидуальный Предприниматель Пушкина Е.Н. (ИНН ${data.landlordInn}), именуемая в дальнейшем «Арендодатель», с одной стороны, и`;

    doc.text(landlordText, { lineGap: 3 });
    doc.moveDown(0.5);

    let tenantText: string;
    if (data.tenantType === 'individual') {
      tenantText = `${data.tenantName}, паспорт серия ${data.tenantPassportSeries} номер ${data.tenantPassportNumber}, выдан ${data.tenantPassportIssued} ${formatDateRu(data.tenantPassportDate)}, код подразделения ${data.tenantPassportCode}, дата рождения ${formatDateRu(data.tenantBirthDate)}, место рождения: ${data.tenantBirthPlace}, зарегистрированный(-ая) по адресу: ${data.tenantRegistrationAddress}, телефон: ${data.tenantPhone}, email: ${data.tenantEmail}`;
    } else {
      tenantText = `${data.tenantCompanyName} (ИНН ${data.tenantInn}, ОГРН ${data.tenantOgrn}${data.tenantKpp ? `, КПП ${data.tenantKpp}` : ''}), юридический адрес: ${data.tenantLegalAddress || '—'}, в лице ${data.tenantContactPerson || data.tenantName}`;
    }
    tenantText += `, именуемый(-ая) в дальнейшем «Арендатор», с другой стороны, совместно именуемые «Стороны», заключили настоящий Договор о нижеследующем:`;

    doc.text(tenantText, { lineGap: 3 });
    doc.moveDown(1);

    // Section 1 - Subject
    doc.font('Bold').fontSize(11).text('1. ПРЕДМЕТ ДОГОВОРА', { underline: false });
    doc.moveDown(0.5);
    doc.font('Regular').fontSize(10);

    doc.text(
      `1.1. Арендодатель предоставляет, а Арендатор принимает во временное пользование индивидуальную кладовую (далее — «Кладовая») со следующими характеристиками:`,
      { lineGap: 3 }
    );
    doc.moveDown(0.3);

    // Cell details table
    const details = [
      ['Номер кладовой:', `№${data.cellNumber}`],
      ['Размеры (Ш×Г×В):', `${data.cellWidth} × ${data.cellDepth} × ${data.cellHeight} м`],
      ['Площадь:', `${data.cellArea} м²`],
      ['Объём:', `${data.cellVolume} м³`],
      ['Ярус:', `${data.cellTier}`],
      ['Адрес:', `г. Санкт-Петербург (точный адрес определяется Арендодателем)`],
    ];

    for (const [label, value] of details) {
      doc.font('Bold').text(`    ${label} `, { continued: true });
      doc.font('Regular').text(value);
    }

    doc.moveDown(0.5);
    doc.font('Regular').fontSize(10).text(
      `1.2. Кладовая предоставляется для целей размещения и хранения имущества Арендатора в соответствии со Стандартными условиями.`,
      { lineGap: 3 }
    );

    doc.moveDown(1);

    // Section 2 - Term
    doc.font('Bold').fontSize(11).text('2. СРОК АРЕНДЫ');
    doc.moveDown(0.5);
    doc.font('Regular').fontSize(10);

    doc.text(
      `2.1. Срок пользования Кладовой: с ${formatDateRu(data.startDate)} по ${formatDateRu(data.endDate)} (${data.months} мес.).`,
      { lineGap: 3 }
    );
    doc.text(
      `2.2. Договор может быть пролонгирован на новый срок путём внесения оплаты до истечения текущего Предоплаченного периода.`,
      { lineGap: 3 }
    );

    doc.moveDown(1);

    // Section 3 - Payment
    doc.font('Bold').fontSize(11).text('3. СТОИМОСТЬ И ПОРЯДОК ОПЛАТЫ');
    doc.moveDown(0.5);
    doc.font('Regular').fontSize(10);

    doc.text(`3.1. Стоимость пользования Кладовой составляет ${data.pricePerMonth.toLocaleString('ru-RU')} (${numberToWords(data.pricePerMonth)}) рублей в месяц.`, { lineGap: 3 });
    doc.text(`3.2. Общая сумма по настоящему Договору: ${data.totalAmount.toLocaleString('ru-RU')} (${numberToWords(data.totalAmount)}) рублей за ${data.months} мес.`, { lineGap: 3 });
    doc.text(`3.3. Оплата производится в порядке, предусмотренном Стандартными условиями.`, { lineGap: 3 });
    doc.text(`3.4. Арендодатель не является плательщиком НДС в соответствии с действующим законодательством РФ.`, { lineGap: 3 });

    doc.moveDown(1);

    // Section 4 - Standard Conditions reference
    doc.font('Bold').fontSize(11).text('4. СТАНДАРТНЫЕ УСЛОВИЯ');
    doc.moveDown(0.5);
    doc.font('Regular').fontSize(10);

    doc.text(
      `4.1. Неотъемлемой частью настоящего Договора являются Стандартные условия предоставления индивидуальной Кладовой, размещённые на сайте www.kladovka78.ru в разделе «Документация».`,
      { lineGap: 3 }
    );
    doc.text(
      `4.2. Подписывая настоящий Договор, Арендатор подтверждает, что ознакомлен и согласен со Стандартными условиями в полном объёме.`,
      { lineGap: 3 }
    );

    doc.moveDown(1);

    // Section 5 - Acceptance
    doc.font('Bold').fontSize(11).text('5. АКЦЕПТ И ПОДПИСАНИЕ');
    doc.moveDown(0.5);
    doc.font('Regular').fontSize(10);

    doc.text(
      `5.1. Настоящий Договор заключается путём акцепта (принятия) Арендатором оферты Арендодателя посредством оплаты стоимости аренды Кладовой. Факт оплаты является подтверждением заключения Договора.`,
      { lineGap: 3 }
    );
    doc.text(
      `5.2. Договор одновременно является актом приёма-передачи Кладовой.`,
      { lineGap: 3 }
    );

    // Page break for signatures
    doc.addPage();

    // Section 6 - Requisites
    doc.font('Bold').fontSize(11).text('6. РЕКВИЗИТЫ СТОРОН');
    doc.moveDown(1);

    const colWidth = pageWidth / 2 - 10;
    const startY = doc.y;

    // Landlord column
    doc.font('Bold').fontSize(10).text('АРЕНДОДАТЕЛЬ:', 60, startY);
    doc.moveDown(0.3);
    doc.font('Regular').fontSize(9);
    doc.text(`ИП Пушкина Е.Н.`, 60);
    doc.text(`ИНН: ${data.landlordInn}`, 60);
    doc.text(`Тел.: 8 (911) 810-83-83`, 60);
    doc.text(`Email: info@kladovka78.ru`, 60);
    doc.text(`Сайт: www.kladovka78.ru`, 60);

    // Tenant column
    doc.font('Bold').fontSize(10).text('АРЕНДАТОР:', 60 + colWidth + 20, startY);
    const tenantColX = 60 + colWidth + 20;
    doc.font('Regular').fontSize(9);

    if (data.tenantType === 'individual') {
      doc.text(data.tenantName, tenantColX);
      doc.text(`Паспорт: ${data.tenantPassportSeries} ${data.tenantPassportNumber}`, tenantColX);
      doc.text(`Адрес: ${data.tenantRegistrationAddress}`, tenantColX, undefined, { width: colWidth });
      doc.text(`Тел.: ${data.tenantPhone}`, tenantColX);
      doc.text(`Email: ${data.tenantEmail}`, tenantColX);
    } else {
      doc.text(data.tenantCompanyName || '', tenantColX);
      doc.text(`ИНН: ${data.tenantInn}`, tenantColX);
      doc.text(`ОГРН: ${data.tenantOgrn}`, tenantColX);
      doc.text(`Адрес: ${data.tenantLegalAddress || '—'}`, tenantColX, undefined, { width: colWidth });
    }

    doc.moveDown(3);

    // Signatures
    const sigY = doc.y;
    doc.font('Regular').fontSize(10);
    doc.text('_________________________', 60, sigY);
    doc.text('Пушкина Е.Н.', 60);

    doc.text('_________________________', tenantColX, sigY);
    doc.text(data.tenantType === 'individual' ? data.tenantName.split(' ').slice(0, 2).join(' ') : (data.tenantContactPerson || ''), tenantColX);

    doc.moveDown(3);

    // Footer note
    doc.font('Regular').fontSize(8).fillColor('#666666').text(
      `Документ сформирован автоматически системой Кладовка78. Акцептом (подтверждением) данного Договора является факт оплаты.`,
      60,
      doc.y,
      { align: 'center', width: pageWidth }
    );

    doc.end();
  });
}

/** Simple number-to-words for ruble amounts (simplified) */
function numberToWords(n: number): string {
  // Simplified — returns formatted string
  const intPart = Math.floor(n);
  if (intPart === 0) return 'ноль';

  const units = ['', 'одна тысяча', 'две тысячи', 'три тысячи', 'четыре тысячи', 'пять тысяч',
    'шесть тысяч', 'семь тысяч', 'восемь тысяч', 'девять тысяч'];

  // For simplicity, just return the number as string with "руб."
  return `${intPart.toLocaleString('ru-RU')}`;
}

// POST /api/contracts/generate — generate contract PDF
contractsRouter.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rentalId } = req.body;

    if (!rentalId) {
      throw new AppError('rentalId обязателен', 400);
    }

    // Fetch rental with cell and customer data
    const [rentals] = await pool.query(`
      SELECT r.*, 
        c.number as cell_number, c.width as cell_width, c.depth as cell_depth,
        c.height as cell_height, c.area as cell_area, c.volume as cell_volume, c.tier as cell_tier,
        cu.name as customer_name, cu.phone as customer_phone, cu.email as customer_email,
        cu.type as customer_type, cu.telegram_id,
        cu.passport_series, cu.passport_number, cu.passport_issued, cu.passport_date,
        cu.passport_code, cu.birth_date, cu.birth_place, cu.registration_address,
        cu.company_name, cu.inn as customer_inn, cu.ogrn as customer_ogrn,
        cu.kpp as customer_kpp, cu.legal_address, cu.contact_person
      FROM rentals r
      JOIN cells c ON r.cell_id = c.id
      JOIN customers cu ON r.customer_id = cu.id
      WHERE r.id = ?
    `, [rentalId]);

    const rows = rentals as any[];
    if (rows.length === 0) {
      throw new AppError('Аренда не найдена', 404);
    }

    const r = rows[0];
    const contractNumber = generateContractNumber(rentalId);

    const contractData: ContractData = {
      contractNumber,
      contractDate: r.start_date || new Date().toISOString(),
      landlordName: 'ИП Пушкина Е.Н.',
      landlordInn: '780529368973',
      tenantName: r.customer_name,
      tenantPassportSeries: r.passport_series || '',
      tenantPassportNumber: r.passport_number || '',
      tenantPassportIssued: r.passport_issued || '',
      tenantPassportDate: r.passport_date || '',
      tenantPassportCode: r.passport_code || '',
      tenantBirthDate: r.birth_date || '',
      tenantBirthPlace: r.birth_place || '',
      tenantRegistrationAddress: r.registration_address || '',
      tenantPhone: r.customer_phone,
      tenantEmail: r.customer_email || '',
      tenantCompanyName: r.company_name,
      tenantInn: r.customer_inn,
      tenantOgrn: r.customer_ogrn,
      tenantKpp: r.customer_kpp,
      tenantLegalAddress: r.legal_address,
      tenantContactPerson: r.contact_person,
      cellNumber: r.cell_number,
      cellWidth: Number(r.cell_width),
      cellDepth: Number(r.cell_depth),
      cellHeight: Number(r.cell_height),
      cellArea: Number(r.cell_area),
      cellVolume: Number(r.cell_volume),
      cellTier: Number(r.cell_tier),
      startDate: r.start_date,
      endDate: r.end_date,
      months: r.months || 1,
      pricePerMonth: Number(r.price_per_month),
      totalAmount: Number(r.total_amount),
      tenantType: r.customer_type || 'individual',
    };

    const pdfBuffer = await buildContractPdf(contractData);

    // Save to filesystem
    const contractsDir = path.join(__dirname, '..', '..', 'uploads', 'contracts');
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }

    const filename = `contract-${contractNumber}.pdf`;
    const filepath = path.join(contractsDir, filename);
    fs.writeFileSync(filepath, pdfBuffer);

    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${proto}://${req.get('host')}`;
    const downloadUrl = `${baseUrl}/uploads/contracts/${filename}`;

    res.json({
      success: true,
      data: {
        contractNumber,
        filename,
        downloadUrl,
        telegramId: r.telegram_id,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/contracts/:rentalId/download — download existing contract
contractsRouter.get('/:rentalId/download', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Generate on the fly
    const fakeReq = { body: { rentalId: req.params.rentalId }, headers: req.headers, protocol: req.protocol, get: req.get.bind(req) } as any;
    const contractsDir = path.join(__dirname, '..', '..', 'uploads', 'contracts');

    // Check if already exists
    const existingFiles = fs.existsSync(contractsDir) ? fs.readdirSync(contractsDir) : [];
    // For simplicity, regenerate every time to ensure latest data
    const [rentals] = await pool.query(`
      SELECT r.*, 
        c.number as cell_number, c.width as cell_width, c.depth as cell_depth,
        c.height as cell_height, c.area as cell_area, c.volume as cell_volume, c.tier as cell_tier,
        cu.name as customer_name, cu.phone as customer_phone, cu.email as customer_email,
        cu.type as customer_type,
        cu.passport_series, cu.passport_number, cu.passport_issued, cu.passport_date,
        cu.passport_code, cu.birth_date, cu.birth_place, cu.registration_address,
        cu.company_name, cu.inn as customer_inn, cu.ogrn as customer_ogrn,
        cu.kpp as customer_kpp, cu.legal_address, cu.contact_person
      FROM rentals r
      JOIN cells c ON r.cell_id = c.id
      JOIN customers cu ON r.customer_id = cu.id
      WHERE r.id = ?
    `, [req.params.rentalId]);

    const rows = rentals as any[];
    if (rows.length === 0) {
      throw new AppError('Аренда не найдена', 404);
    }

    const r = rows[0];
    const contractNumber = generateContractNumber(req.params.rentalId);

    const contractData: ContractData = {
      contractNumber,
      contractDate: r.start_date || new Date().toISOString(),
      landlordName: 'ИП Пушкина Е.Н.',
      landlordInn: '780529368973',
      tenantName: r.customer_name,
      tenantPassportSeries: r.passport_series || '',
      tenantPassportNumber: r.passport_number || '',
      tenantPassportIssued: r.passport_issued || '',
      tenantPassportDate: r.passport_date || '',
      tenantPassportCode: r.passport_code || '',
      tenantBirthDate: r.birth_date || '',
      tenantBirthPlace: r.birth_place || '',
      tenantRegistrationAddress: r.registration_address || '',
      tenantPhone: r.customer_phone,
      tenantEmail: r.customer_email || '',
      tenantCompanyName: r.company_name,
      tenantInn: r.customer_inn,
      tenantOgrn: r.customer_ogrn,
      tenantKpp: r.customer_kpp,
      tenantLegalAddress: r.legal_address,
      tenantContactPerson: r.contact_person,
      cellNumber: r.cell_number,
      cellWidth: Number(r.cell_width),
      cellDepth: Number(r.cell_depth),
      cellHeight: Number(r.cell_height),
      cellArea: Number(r.cell_area),
      cellVolume: Number(r.cell_volume),
      cellTier: Number(r.cell_tier),
      startDate: r.start_date,
      endDate: r.end_date,
      months: r.months || 1,
      pricePerMonth: Number(r.price_per_month),
      totalAmount: Number(r.total_amount),
      tenantType: r.customer_type || 'individual',
    };

    const pdfBuffer = await buildContractPdf(contractData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="contract-${contractNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});
