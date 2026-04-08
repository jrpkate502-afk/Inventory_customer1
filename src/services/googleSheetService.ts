import { POData } from "../types";

const PO_SHEET_URL = "https://docs.google.com/spreadsheets/d/103dALwyztqHunKjVxOggzXcCvywd3lUaBUh9SS9I_WU/export?format=csv";
const EGP_SHEET_URL = "https://docs.google.com/spreadsheets/d/1vi9Zy43Vc0nk02Steu87DiS7TG8wVSU_gYJwdUTCnos/export?format=csv";

export async function fetchPOData(query: string, type: "po" | "egp" = "po"): Promise<POData | null> {
  try {
    const url = type === "po" ? PO_SHEET_URL : EGP_SHEET_URL;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch data");
    
    const csvText = await response.text();
    const rows = csvText.split("\n").map(row => parseCSVRow(row));
    
    if (rows.length < 2) return null;
    
    const headers = rows[0];
    
    if (type === "po") {
      const poIndex = headers.findIndex(h => h.trim() === "po_number");
      const supplierIndex = headers.findIndex(h => h.trim() === "company");
      const biddingIndex = headers.findIndex(h => h.trim() === "bidding_number");
      const contractIdIndex = headers.findIndex(h => h.trim() === "contract_number");
      const locationIndex = headers.findIndex(h => h.trim() === "ba");
      const statusIndex = headers.findIndex(h => h.trim() === "state");

      const dataRow = rows.slice(1).find(row => {
        const val = row[poIndex]?.trim();
        return val === query.trim();
      });
      
      if (!dataRow) return null;
      
      return {
        poNo: dataRow[poIndex] || "",
        supplier: dataRow[supplierIndex] || "",
        orderId: dataRow[biddingIndex] || "",
        contractId: dataRow[contractIdIndex] || "",
        location: dataRow[locationIndex] || "",
        status: dataRow[statusIndex] || "บริษัทส่งของแล้ว",
      };
    } else {
      // e-GP Mapping:
      // Bid No. (Col A) -> เลขบิด
      // e_GP (Col B) -> หมายเลขโครงการ e-GP
      // How_to (Col C) -> วิธีการจัดซื้อ
      // วันที่ประกาศผล (Col D) -> วันที่ประกาศผลผู้ชนะ
      // Winner_Announcement (Col E) -> Current Status
      
      const bidNoIndex = headers.findIndex(h => h.trim() === "Bid No.");
      const egpIndex = headers.findIndex(h => h.trim() === "e_GP");
      const howToIndex = headers.findIndex(h => h.trim() === "How_to");
      const announcementDateIndex = headers.findIndex(h => h.trim() === "วันที่ประกาศผล");
      const statusIndex = headers.findIndex(h => h.trim() === "สถานะ" || h.trim() === "Winner_Announcement");

      const dataRow = rows.slice(1).find(row => {
        const val = row[egpIndex]?.trim();
        return val === query.trim();
      });
      
      if (!dataRow) return null;
      
      return {
        bidNo: dataRow[bidNoIndex] || "",
        egp: dataRow[egpIndex] || "",
        howTo: dataRow[howToIndex] || "",
        announcementDate: dataRow[announcementDateIndex] || "",
        status: dataRow[statusIndex] || "ประกาศผู้ชนะ",
      };
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

function parseCSVRow(row: string): string[] {
  const result = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
