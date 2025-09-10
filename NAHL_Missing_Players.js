function appendUniqueNAHLStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nahlSheet = ss.getSheetByName("NAHL");
  var statsSheet = ss.getSheetByName("NAHL STATS");

  if (!nahlSheet || !statsSheet) {
    Logger.log("One or both sheets not found.");
    return;
  }

  // Get existing names in "NAHL" from column E
  var nahlNames = nahlSheet.getRange("E2:E" + nahlSheet.getLastRow()).getValues().flat();
  var nahlSet = new Set(nahlNames); // Convert to Set for faster lookup

  // Get all data from "NAHL STATS"
  var lastRow = statsSheet.getLastRow();
  var lastColumn = statsSheet.getLastColumn();
  var statsData = statsSheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();

  var newRows = [];

  // Check if names in "NAHL STATS" exist in the set of "NAHL"
  statsData.forEach(row => {
    var name = row[0]; // Column A in "NAHL STATS"
    if (!nahlSet.has(name)) {
      newRows.push(row); // Directly add row data
    }
  });

  // Append new rows to "NAHL" starting at column E if there are any
  if (newRows.length > 0) {
    var startRow = Math.max(nahlSheet.getLastRow() + 1, 2); // Ensure valid row number
    var startColumn = 5; // Column E
    nahlSheet.getRange(startRow, startColumn, newRows.length, newRows[0].length).setValues(newRows);
    Logger.log(newRows.length + " new rows appended.");
  } else {
    Logger.log("No new rows to append.");
  }
}
