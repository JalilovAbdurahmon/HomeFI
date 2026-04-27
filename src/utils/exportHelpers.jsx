import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { FileSpreadsheet, FileText } from "lucide-react";

// 🟢 FULL EXCEL FIX
export const exportToExcel = async (allItems, dateFilter = null) => {
  if (!allItems || allItems.length === 0) return alert("Ma'lumot topilmadi!");

  let dataToExport = [...allItems];
  if (dateFilter?.from && dateFilter?.to) {
    const fromDate = new Date(dateFilter.from).setHours(0, 0, 0, 0);
    const toDate = new Date(dateFilter.to).setHours(23, 59, 59, 999);
    dataToExport = allItems.filter((item) => {
      const d = new Date(item.dateOfPayment).getTime();
      return d >= fromDate && d <= toDate;
    });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Communal Report");

  const totalSum = dataToExport.reduce(
    (acc, item) => acc + Number(item.sum || 0),
    0
  );
  const now = new Date().toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // --- 🎨 TEPADA KATTA DATA & TIME BLOKI ---
  worksheet.mergeCells("A1:E2");
  const dateHeader = worksheet.getCell("A1");
  dateHeader.value = `ОТЧЕТ СФОРМИРОВАН: ${now}`;
  dateHeader.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  dateHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E293B" },
  };
  dateHeader.alignment = { horizontal: "center", vertical: "middle" };

  // --- 💰 TOTAL SUM BLOKI ---
  worksheet.mergeCells("A3:E3");
  const totalBar = worksheet.getCell("A3");
  totalBar.value = `ИТОГО К ОПЛАТЕ: ${totalSum.toLocaleString()} UZS`;
  totalBar.font = { bold: true, size: 14, color: { argb: "FF10B981" } };
  totalBar.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" },
  };
  totalBar.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(3).height = 30;

  worksheet.addRow([]);

  // --- 📋 JADVAL USTUNLARI ---
  worksheet.columns = [
    { key: "id", width: 10 },
    { key: "service", width: 35 },
    { key: "date", width: 20 },
    { key: "desc", width: 45 },
    { key: "sum", width: 25 },
  ];

  // --- 🏗️ HEADER (TH) ---
  const headerRow = worksheet.addRow([
    "№",
    "Услуга",
    "Дата",
    "Примечание",
    "Сумма (UZS)",
  ]);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = { bottom: { style: "medium", color: { argb: "FF312E81" } } };
  });

  // --- 🧾 DATA QATORLARI ---
  dataToExport.forEach((item, index) => {
    const row = worksheet.addRow({
      id: index + 1,
      service: item.titleCommunal?.title || item.titleCommunal,
      date: new Date(item.dateOfPayment).toLocaleDateString("ru-RU"),
      desc: item.desc || "-",
      sum: Number(item.sum).toLocaleString(),
    });
    row.height = 25;
  });

  // --- 🖌️ DIZAYN ---
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 5) {
      row.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
        if (colNumber === 1) {
          cell.font = { bold: true, size: 11 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        }
        if (colNumber === 5) {
          cell.font = { bold: true };
        }
      });
      if (rowNumber % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };
      }
    }
  });

  // 🛠️ FAYL NOMI UCHUN FAQAT SANA (Vaqtsiz: YYYY-MM-DD)
  const fileDate = new Date().toISOString().split("T")[0];

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Отчёт_${fileDate}.xlsx`);

  // 🎉 Muvaffaqiyatli xabar
  toast.success(
    ({ closeToast }) => (
      <div className="flex items-center gap-3 py-1">
        <div className="bg-[#10b981] p-2 rounded-xl shadow-lg shadow-[#10b981]/20">
          <FileSpreadsheet size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
          <p className="text-gray-800 font-extrabold text-[13px] leading-tight uppercase">
            Отчёт сохранён!
          </p>
          <p className="text-[11px] mt-0.5 font-semibold text-[#10b981]">
            Формат: EXCEL (.xlsx)
          </p>
        </div>
      </div>
    ),
    { icon: false, className: "rounded-2xl border-none shadow-2xl bg-white" }
  );
};

// 🔵 PRODUCTS UCHUN ALOHIDA EXCEL EXPORT
export const exportProductsToExcel = async (allItems, dateFilter = null) => {
  if (!allItems || allItems.length === 0) return alert("Ma'lumot topilmadi!");

  let dataToExport = [...allItems];
  if (dateFilter?.from && dateFilter?.to) {
    const fromDate = new Date(dateFilter.from).setHours(0, 0, 0, 0);
    const toDate = new Date(dateFilter.to).setHours(23, 59, 59, 999);
    dataToExport = allItems.filter((item) => {
      const d = new Date(item.dateOfPayment).getTime();
      return d >= fromDate && d <= toDate;
    });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Products Report");

  const totalSum = dataToExport.reduce(
    (acc, item) => acc + Number(item.sum || 0),
    0
  );
  const now = new Date().toLocaleString("ru-RU");

  // --- 🎨 TEPADA KATTA SARLAVHA ---
  worksheet.mergeCells("A1:G2");
  const dateHeader = worksheet.getCell("A1");
  dateHeader.value = `ОТЧЕТ ПО ПРОДУКТАМ: ${now}`;
  dateHeader.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  dateHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E293B" },
  };
  dateHeader.alignment = { horizontal: "center", vertical: "middle" };

  // --- 💰 TOTAL SUM BLOKI ---
  worksheet.mergeCells("A3:G3");
  const totalBar = worksheet.getCell("A3");
  totalBar.value = `ИТОГО СУММА: ${totalSum.toLocaleString()} UZS`;
  totalBar.font = { bold: true, size: 14, color: { argb: "FF3B59CE" } };
  totalBar.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" },
  };
  totalBar.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(3).height = 25;

  worksheet.addRow([]); // Bo'sh joy

  // --- 📋 JADVAL USTUNLARI ---
  worksheet.columns = [
    { key: "id", width: 8 },
    { key: "title", width: 30 },
    { key: "unit", width: 12 },
    { key: "qty", width: 12 },
    { key: "price", width: 18 },
    { key: "date", width: 18 },
    { key: "sum", width: 22 },
  ];

  // --- 🏗️ HEADER (TH) DIZAYNI ---
  const headerRow = worksheet.addRow([
    "№",
    "Наименование",
    "Ед. изм.",
    "Кол-во",
    "Цена за ед.",
    "Дата",
    "Сумма (UZS)",
  ]);

  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B59CE" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // --- 🧾 MA'LUMOTLARNI QO'SHISH ---
  dataToExport.forEach((item, index) => {
    const row = worksheet.addRow({
      id: index + 1,
      title: item.title || "-",
      unit: item.edinisaIzmereniya?.title || "-",
      qty: item.quantity || 0,
      price: Number(item.priceForOne || 0).toLocaleString(),
      date: item.dateOfPayment || "-",
      sum: Number(item.sum || 0).toLocaleString(),
    });

    row.height = 25;

    // --- 🖌️ HAR BIR KATACHANI CENTER QILISH VA DIZAYN BERISH ---
    row.eachCell((cell, colNumber) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      // № va Summa ustunlarini bold qilish
      if (colNumber === 1 || colNumber === 7) {
        cell.font = { bold: true };
      }
    });

    // Zebra effekti (rangli qatorlar)
    if ((index + 1) % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8FAFC" },
      };
    }
  });

  // Fayl nomi
  const dateString = new Date().toISOString().split("T")[0];
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Products_Report_${dateString}.xlsx`);

  toast.success(
    ({ closeToast }) => (
      <div className="flex items-center gap-3 py-1">
        <div className="bg-[#10b981] p-2 rounded-xl shadow-lg shadow-[#10b981]/20">
          <FileSpreadsheet size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
          <p className="text-gray-800 font-extrabold text-[13px] leading-tight uppercase">
            Отчёт продуктов сохранён!
          </p>
          <p className="text-[11px] mt-0.5 font-semibold text-[#10b981]">
            Формат: EXCEL (.xlsx)
          </p>
        </div>
      </div>
    ),
    { icon: false, className: "rounded-2xl border-none shadow-2xl bg-white" }
  );
};

// 🔴 FULL PDF FIX
export const exportToPDF = (allItems, dateFilter = null) => {
  let dataToExport = [...allItems];
  if (dateFilter?.from && dateFilter?.to) {
    const fromDate = new Date(dateFilter.from).setHours(0, 0, 0, 0);
    const toDate = new Date(dateFilter.to).setHours(23, 59, 59, 999);
    dataToExport = allItems.filter((item) => {
      const d = new Date(item.dateOfPayment).getTime();
      return d >= fromDate && d <= toDate;
    });
  }

  const doc = new jsPDF();
  const totalSum = dataToExport.reduce(
    (acc, item) => acc + Number(item.sum || 0),
    0
  );

  // 🎨 HEADER GREEN DESIGN
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("COMMUNAL REPORT", 14, 18);

  // 💰 TOTAL SUM (TEPADA, O'NGDA)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL AMOUNT: ${totalSum.toLocaleString()} UZS`, 14, 33);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleString("ru-RU")}`, 150, 18);

  const tableData = dataToExport.map((item, index) => [
    index + 1,
    item.titleCommunal?.title || item.titleCommunal || "-",
    new Date(item.dateOfPayment).toLocaleDateString("ru-RU"),
    item.desc || "-",
    `${Number(item.sum).toLocaleString()} UZS`,
  ]);

  autoTable(doc, {
    startY: 50, // Jadvalni pastroqdan boshlaymiz, chunki tepada summa bor
    head: [["№", "Service", "Date", "Note", "Amount"]],
    body: tableData,
    theme: "grid",
    styles: {
      font: "courier",
      fontSize: 9,
      halign: "center",
      valign: "middle",
    },
    headStyles: { fillColor: [16, 185, 129], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 15, fontStyle: "bold" },
      1: { halign: "left" },
      3: { halign: "left" },
      4: { halign: "right", fontStyle: "bold" },
    },
  });

  doc.save(`Отчёт ${new Date().toLocaleDateString("ru-RU")}.pdf`);

  // 🎉 Muvaffaqiyatli xabar
  toast.success(
    ({ closeToast }) => (
      <div className="flex items-center gap-3 py-1">
        <div className="bg-[#ef4444] p-2 rounded-xl shadow-lg shadow-[#ef4444]/20">
          <FileText size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
          <p className="text-gray-800 font-extrabold text-[13px] leading-tight uppercase">
            Отчёт сохранён!
          </p>
          <p className="text-[11px] mt-0.5 font-semibold text-[#ef4444]">
            Формат: PDF (.pdf)
          </p>
        </div>
      </div>
    ),
    { icon: false, className: "rounded-2xl border-none shadow-2xl bg-white" }
  );
};

// 🔵 PRODUCTS UCHUN ALOHIDA PDF EXPORT
export const exportProductsToPDF = (allItems, dateFilter = null) => {
  if (!allItems || allItems.length === 0) return alert("Ma'lumot topilmadi!");

  let dataToExport = [...allItems];
  // ... filter mantiqi o'sha-o'sha ...

  const doc = new jsPDF();
  const totalSum = dataToExport.reduce(
    (acc, item) => acc + Number(item.sum || 0),
    0
  );

  doc.setFillColor(59, 89, 206);
  doc.rect(0, 0, 210, 45, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("PRODUCTS REPORT", 14, 20);
  doc.setFontSize(12);
  doc.text(`TOTAL: ${totalSum.toLocaleString()} UZS`, 14, 33);

  // Jadval ma'lumotlari (7-ta ustun bilan)
  const tableData = dataToExport.map((item, index) => [
    index + 1,
    item.title || "-",
    item.edinisaIzmereniya?.title || "-",
    item.quantity || 0,
    Number(item.priceForOne || 0).toLocaleString(), // Yangi qator
    item.dateOfPayment || "-",
    `${Number(item.sum).toLocaleString()} UZS`,
  ]);

  autoTable(doc, {
    startY: 50,
    head: [["#", "Product", "Unit", "Qty", "Price/Unit", "Date", "Sum"]], // Header yangilandi
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [59, 89, 206] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      4: { halign: "right" }, // Price/Unit ustuni
      6: { halign: "right", fontStyle: "bold" },
    },
  });

  // Fayl nomi uchun faqat sanani olish
  const dateString = new Date().toISOString().split("T")[0];

  doc.save(`Products_Report_${dateString}.pdf`);
  toast.success(
    ({ closeToast }) => (
      <div className="flex items-center gap-3 py-1">
        <div className="bg-[#ef4444] p-2 rounded-xl shadow-lg shadow-[#ef4444]/20">
          <FileText size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
          <p className="text-gray-800 font-extrabold text-[13px] leading-tight uppercase">
            Отчёт продуктов сохранён!
          </p>
          <p className="text-[11px] mt-0.5 font-semibold text-[#ef4444]">
            Формат: PDF (.pdf)
          </p>
        </div>
      </div>
    ),
    { icon: false, className: "rounded-2xl border-none shadow-2xl bg-white" }
  );
};
