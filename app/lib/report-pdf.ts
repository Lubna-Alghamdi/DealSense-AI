import { GState, jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import {
  formatCurrency,
  formatLeadTime,
  formatQuantity,
  formatUnitCost,
  PRIORITY_LABELS,
  type Priority,
} from "@/lib/comparison";
import { buildReportAssumptions } from "@/lib/report-assumptions";

type RGB = [number, number, number];

const NAVY: RGB = [18, 33, 85];
const BLUE: RGB = [30, 64, 175];
const ACCENT: RGB = [125, 211, 252];
const WHITE: RGB = [255, 255, 255];
const INK: RGB = [15, 23, 42];
const MUTED: RGB = [100, 116, 139];
const LINE: RGB = [226, 232, 240];
const LIGHT: RGB = [244, 247, 251];
const BAR_IDLE: RGB = [191, 206, 240];
const ROW_HIGHLIGHT: RGB = [219, 234, 254];

interface Palette {
  label: RGB;
  title: RGB;
  rule: RGB;
  value: RGB;
  muted: RGB;
  line: RGB;
  bar: RGB;
  highlightBar: RGB;
  highlightName: RGB;
  name: RGB;
}

const PAPER: Palette = {
  label: BLUE,
  title: NAVY,
  rule: BLUE,
  value: NAVY,
  muted: MUTED,
  line: LINE,
  bar: BAR_IDLE,
  highlightBar: BLUE,
  highlightName: NAVY,
  name: MUTED,
};

const MARGIN = 48;
const TOP = 64;

export interface ReportPdfRow {
  name: string;
  orderQuantity: number;
  extraUnits: number;
  totalCost: number;
  leadTimeDays: number;
  costPerUnit: number;
}

export interface ReportPdfInput {
  productName: string;
  requestedQuantity: number;
  priority: Priority;
  recommended: ReportPdfRow | undefined;
  rows: ReportPdfRow[];
}

export function downloadReportPdf(input: ReportPdfInput) {
  const { productName, requestedQuantity, priority, recommended, rows } = input;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;

  drawCover(doc, { productName, requestedQuantity, priority, pageWidth, pageHeight });

  doc.addPage();
  let y = drawSectionHeading(doc, PAPER, "01", "Recommendation", MARGIN, TOP);
  if (recommended) {
    y = drawRecommendationCard(doc, recommended, MARGIN, y, contentWidth);
  }
  drawCostChart(doc, PAPER, rows, recommended?.name, MARGIN, y + 24, contentWidth);

  doc.addPage();
  y = drawSectionHeading(doc, PAPER, "03", "Supplier comparison", MARGIN, TOP);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Supplier", "Order Qty", "MOQ extra", "Total Cost", "Lead Time", "Cost / purchased unit"]],
    body: rows.map((row) => [
      row.name,
      formatQuantity(row.orderQuantity),
      row.extraUnits > 0 ? `${formatQuantity(row.extraUnits)} extra` : "-",
      formatCurrency(row.totalCost),
      formatLeadTime(row.leadTimeDays),
      formatUnitCost(row.costPerUnit),
    ]),
    styles: { fontSize: 9, cellPadding: 7, textColor: INK, lineColor: LINE, lineWidth: 0.5 },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    didParseCell: (data) => {
      if (data.section === "body" && rows[data.row.index]?.name === recommended?.name) {
        data.cell.styles.fillColor = ROW_HIGHLIGHT;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 36;
  if (y > pageHeight - 220) {
    doc.addPage();
    y = TOP;
  }
  y = drawSectionHeading(doc, PAPER, "04", "Assumptions", MARGIN, y);
  y = drawAssumptions(doc, y, contentWidth, buildReportAssumptions(input));

  drawFooters(doc, pageWidth, pageHeight);

  const slug =
    productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "report";
  doc.save(`dealsense-report-${slug}.pdf`);
}

function buildAssumptions({
  productName,
  requestedQuantity,
  priority,
  recommended,
  rows,
}: ReportPdfInput): string[] {
  const assumptions = [
    `${formatQuantity(requestedQuantity)} units of ${productName} are assumed to be purchased, so each supplier is priced at that quantity or its MOQ, whichever is larger.`,
  ];

  const cheapest = minBy(rows, (row) => row.totalCost);
  const fastest = minBy(rows, (row) => row.leadTimeDays);
  const withExtra = rows.filter((row) => row.extraUnits > 0);

  if (recommended && cheapest) {
    if (cheapest.name === recommended.name) {
      assumptions.push(
        `${recommended.name} is also the lowest-cost quote, so the ${PRIORITY_LABELS[priority].toLowerCase()} priority involves no cost trade-off.`,
      );
    } else {
      const premium = recommended.totalCost - cheapest.totalCost;
      assumptions.push(
        `${cheapest.name} has the lowest total cost at ${formatCurrency(cheapest.totalCost)}. ${recommended.name} costs ${formatCurrency(premium)} more, and the recommendation assumes its delivery terms justify that difference under the ${PRIORITY_LABELS[priority].toLowerCase()} priority.`,
      );
    }
  }

  if (recommended && fastest) {
    if (fastest.leadTimeDays < recommended.leadTimeDays) {
      assumptions.push(
        `${fastest.name} delivers fastest in ${formatLeadTime(fastest.leadTimeDays)}, compared with ${formatLeadTime(recommended.leadTimeDays)} for ${recommended.name}.`,
      );
    } else {
      assumptions.push(
        `${recommended.name} also has the shortest lead time at ${formatLeadTime(recommended.leadTimeDays)}.`,
      );
    }
  }

  if (withExtra.length > 0) {
    const details = withExtra
      .map((row) => `${row.name} (${formatQuantity(row.extraUnits)} extra)`)
      .join(", ");
    assumptions.push(
      `The MOQ forces extra purchases: ${details}. These extra units are paid for and included in total cost.`,
    );
  } else if (rows.length > 0) {
    assumptions.push(
      "No supplier's MOQ exceeds the requested quantity, so no extra units are added to any quote.",
    );
  }

  assumptions.push(
    "Costs include only the unit price, shipping, and MOQ-adjusted quantity entered for each supplier. Taxes, customs, currency conversion, and quality checks are excluded.",
  );

  return assumptions;
}

function minBy<T>(items: T[], score: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>(
    (best, item) => (best === undefined || score(item) < score(best) ? item : best),
    undefined,
  );
}

const DISCLOSURE =
  "DealSense AI provides recommendations based only on the entered quotation data and does not verify supplier reliability, product quality, tax, customs, or external purchasing costs.";

function setFill(doc: jsPDF, [r, g, b]: RGB) {
  doc.setFillColor(r, g, b);
}

function setInk(doc: jsPDF, [r, g, b]: RGB) {
  doc.setTextColor(r, g, b);
}

function setStroke(doc: jsPDF, [r, g, b]: RGB) {
  doc.setDrawColor(r, g, b);
}

function paintPage(doc: jsPDF, color: RGB, pageWidth: number, pageHeight: number) {
  setFill(doc, color);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
}

function drawCover(
  doc: jsPDF,
  {
    productName,
    requestedQuantity,
    priority,
    pageWidth,
    pageHeight,
  }: {
    productName: string;
    requestedQuantity: number;
    priority: Priority;
    pageWidth: number;
    pageHeight: number;
  },
) {
  paintPage(doc, NAVY, pageWidth, pageHeight);

  doc.setGState(new GState({ opacity: 0.08 }));
  doc.setFillColor(255, 255, 255);
  doc.circle(pageWidth - 40, 140, 230, "F");
  doc.circle(40, pageHeight - 60, 170, "F");
  doc.setGState(new GState({ opacity: 1 }));

  setInk(doc, ACCENT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("DEALSENSE AI  |  SUPPLIER COMPARISON", MARGIN, 120);

  setInk(doc, WHITE);
  doc.setFontSize(44);
  doc.text("FINAL COMPARISON", MARGIN, 220);
  setInk(doc, ACCENT);
  doc.text("REPORT", MARGIN, 270);

  setInk(doc, WHITE);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(20);
  doc.text(productName, MARGIN, 320);

  setInk(doc, [200, 215, 240]);
  doc.setFontSize(11);
  doc.text(`Requested quantity: ${formatQuantity(requestedQuantity)}`, MARGIN, 348);
  doc.text(`Priority: ${PRIORITY_LABELS[priority]}`, MARGIN, 364);

  setStroke(doc, ACCENT);
  doc.setLineWidth(1);
  doc.line(MARGIN, pageHeight - 120, MARGIN + 60, pageHeight - 120);

  setInk(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Transparency  |  Accuracy  |  Value", MARGIN, pageHeight - 100);
  setInk(doc, [200, 215, 240]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Based only on the entered supplier quotations.", MARGIN, pageHeight - 84);
}

function drawSectionHeading(
  doc: jsPDF,
  palette: Palette,
  index: string,
  title: string,
  x: number,
  y: number,
) {
  setInk(doc, palette.label);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`SECTION ${index}`, x, y);
  setInk(doc, palette.title);
  doc.setFontSize(20);
  doc.text(title, x, y + 24);
  setFill(doc, palette.rule);
  doc.rect(x, y + 34, 36, 3, "F");
  return y + 60;
}

function drawRecommendationCard(
  doc: jsPDF,
  recommended: ReportPdfRow,
  x: number,
  y: number,
  width: number,
) {
  const height = 150;
  setFill(doc, NAVY);
  doc.roundedRect(x, y, width, height, 14, 14, "F");

  const innerX = x + 24;
  const innerWidth = width - 48;

  setInk(doc, ACCENT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("RECOMMENDED SUPPLIER", innerX, y + 30);

  setInk(doc, WHITE);
  doc.setFontSize(22);
  doc.text(recommended.name, innerX, y + 58);

  const stats = [
    { glyph: "SAR", label: "Total cost", value: formatCurrency(recommended.totalCost) },
    { glyph: "DAY", label: "Delivery", value: formatLeadTime(recommended.leadTimeDays) },
    { glyph: "QTY", label: "Purchase quantity", value: formatQuantity(recommended.orderQuantity) },
  ];
  const columnWidth = innerWidth / stats.length;
  const rowTop = y + 90;

  stats.forEach((stat, index) => {
    const cx = innerX + index * columnWidth;
    setFill(doc, ACCENT);
    doc.circle(cx + 14, rowTop + 14, 14, "F");
    setInk(doc, NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(stat.glyph, cx + 14, rowTop + 16.5, { align: "center" });

    setInk(doc, [200, 220, 255]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(stat.label, cx + 38, rowTop + 9);

    setInk(doc, WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(stat.value, cx + 38, rowTop + 26);
  });

  return y + height;
}

function drawCostChart(
  doc: jsPDF,
  palette: Palette,
  rows: ReportPdfRow[],
  recommendedName: string | undefined,
  x: number,
  y: number,
  width: number,
) {
  const contentTop = drawSectionHeading(doc, palette, "02", "Total cost by supplier", x, y);
  const baseline = contentTop + 174;
  const barAreaHeight = 160;
  const maxCost = Math.max(...rows.map((row) => row.totalCost), 1);
  const slot = width / Math.max(rows.length, 1);
  const barWidth = Math.min(44, slot * 0.5);

  setStroke(doc, palette.line);
  doc.setLineWidth(1);
  doc.line(x, baseline, x + width, baseline);

  rows.forEach((row, index) => {
    const barHeight = (row.totalCost / maxCost) * barAreaHeight;
    const barX = x + index * slot + (slot - barWidth) / 2;
    const barY = baseline - barHeight;
    const isRecommended = row.name === recommendedName;

    setFill(doc, isRecommended ? palette.highlightBar : palette.bar);
    doc.rect(barX, barY, barWidth, barHeight, "F");

    setInk(doc, palette.value);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(formatCurrency(row.totalCost), barX + barWidth / 2, barY - 6, { align: "center" });

    setInk(doc, isRecommended ? palette.highlightName : palette.name);
    doc.setFont("helvetica", isRecommended ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.text(row.name, x + index * slot + slot / 2, baseline + 16, { align: "center" });
  });

  return baseline + 30;
}

function drawAssumptions(doc: jsPDF, startY: number, width: number, assumptions: string[]) {
  let y = startY;
  const textWidth = width - 36;

  assumptions.forEach((text, index) => {
    const lines = doc.splitTextToSize(text, textWidth);
    setInk(doc, BLUE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(String(index + 1).padStart(2, "0"), MARGIN, y);
    setInk(doc, INK);
    doc.setFont("helvetica", "normal");
    doc.text(lines, MARGIN + 30, y);
    y += lines.length * 13 + 8;
  });

  setInk(doc, MUTED);
  doc.setFontSize(8.5);
  const disclosureLines = doc.splitTextToSize(DISCLOSURE, width);
  doc.text(disclosureLines, MARGIN, y + 8);
  return y + disclosureLines.length * 11 + 8;
}

function drawFooters(doc: jsPDF, pageWidth: number, pageHeight: number) {
  const total = doc.getNumberOfPages();
  for (let page = 2; page <= total; page += 1) {
    doc.setPage(page);
    setStroke(doc, PAPER.line);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, pageHeight - 52, pageWidth - MARGIN, pageHeight - 52);
    setInk(doc, PAPER.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("DealSense AI  |  Final Comparison Report", MARGIN, pageHeight - 36);
    doc.text(`Page ${page} of ${total}`, pageWidth - MARGIN, pageHeight - 36, { align: "right" });
  }
}
