import { POData } from "../types";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/103dALwyztqHunKjVxOggzXcCvywd3lUaBUh9SS9I_WU/export?format=csv";

export async function fetchPOData(poNumber: string): Promise<POData | null> {
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error("Failed to fetch data");
    
    const csvText = await response.text();
    const rows = csvText.split("\n").map(row => parseCSVRow(row));
    
    if (rows.length < 2) return null;
    
    const headers = rows[0];
    
    // Find column indices based on headers
    // Mapping:
    // PO NO: "หมายเลข PO"
    // ชื่อบริษัท (Supplier): "ชื่อบริษัท"
    // เลขที่จัดซื้อ (Order ID): "เลขที่จัดซื้อ"
    // เลขที่สัญญา (Contract ID): "เลขที่สัญญา"
    // คลังพัสดุ (Location): "คลังพัสดุ"
    // สถานะ (Status): "สถานะ" (Assuming there's a status column)
    
    // Mapping based on user request and image.png:
    // Column A: state -> Status button
    // Column B: bidding_number -> เลขบิดดิ้ง
    // Column C: company -> ชื่อบริษัท
    // Column D: contract_number -> เลขที่สัญญา
    // Column E: po_number -> PO NO: (Search Key)
    // Column F: ba -> คลังพัสดุ (BA)
    
    const poIndex = headers.findIndex(h => h.trim() === "po_number");
    const supplierIndex = headers.findIndex(h => h.trim() === "company");
    const biddingIndex = headers.findIndex(h => h.trim() === "bidding_number");
    const contractIdIndex = headers.findIndex(h => h.trim() === "contract_number");
    const locationIndex = headers.findIndex(h => h.trim() === "ba");
    const statusIndex = headers.findIndex(h => h.trim() === "state");

    // Search for the row with the matching PO number (Column E)
    const dataRow = rows.slice(1).find(row => {
      const val = row[poIndex]?.trim();
      return val === poNumber.trim();
    });
    
    if (!dataRow) return null;
    
    const result = {
      poNo: dataRow[poIndex] || "",
      supplier: dataRow[supplierIndex] || "",
      orderId: dataRow[biddingIndex] || "", // Using bidding_number for the bidding field
      contractId: dataRow[contractIdIndex] || "",
      location: dataRow[locationIndex] || "",
      status: dataRow[statusIndex] || "บริษัทส่งของแล้ว",
    };

    console.log("Fetched PO Data:", result);
    return result;
  } catch (error) {
    console.error("Error fetching PO data:", error);
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
