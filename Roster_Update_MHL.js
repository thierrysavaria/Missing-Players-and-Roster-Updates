function RosterUpdateMHL() {
  const teamIds = [1, 2, 3, 6, 7, 8, 9, 10]; // Array of team IDs
  teamIds.forEach((teamId, index) => {
    const cleanSheet = index === 0; // Only clean the first sheet
    const url = `https://lscluster.hockeytech.com/feed/index.php?feed=statviewfeed&view=roster&team_id=${teamId}&season_id=39&key=4a948e7faf5ee58d&client_code=mhl&site_id=2&league_id=1&lang=en`;
    NewRosterCSV(url, "Roster_Update_MHL", cleanSheet);
  });
}

function NewRosterCSV(urlParameter, sheetName, cleanSheet) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadSheet.getSheetByName(sheetName);

  if (cleanSheet) {
    sheet.clear(); // Clear the sheet for the first team only
  }

  // Fetch JSON content
  const response = UrlFetchApp.fetch(urlParameter);
  let jsonData = response.getContentText();

  // Remove first and last parentheses if present
  if (jsonData.startsWith("(") && jsonData.endsWith(")")) {
    jsonData = jsonData.slice(1, -1);
  }

  // Parse the cleaned JSON
  const parsedData = JSON.parse(jsonData);
  const teamName = parsedData.teamName; // Extract the team name

  // Combine data from all sections
  let allData = [];
  if (parsedData.roster && Array.isArray(parsedData.roster)) {
    parsedData.roster.forEach((section, index) => {
      if (!section.sections || !Array.isArray(section.sections)) {
        Logger.log(`Skipping roster section at index ${index} because 'sections' is missing or not an array.`);
        return;
      }

      section.sections.forEach((subSection, subIndex) => {
        if (!subSection.data || !Array.isArray(subSection.data)) {
          Logger.log(`Skipping subsection at index ${subIndex} because 'data' is missing or not an array.`);
          return;
        }

        allData = allData.concat(subSection.data);
      });
    });
  }

  if (allData.length > 0) {
    const headers = Object.keys(allData[0].row);

    // Add 'Team Name' to headers if not already present
    if (!headers.includes("Team Name")) {
      headers.push("Team Name");
    }

    let existingHeaders = [];
    if (sheet.getLastRow() > 0 && sheet.getLastColumn() > 0) {
      existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }

    if (existingHeaders.length === 0 || existingHeaders.join() !== headers.join()) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const rows = allData.map(item => headers.map(header => {
      const originalValue = item.row[header] || "";
      const sanitizedValue = sanitizeData(originalValue); // Applying the sanitizeData function here
      return header === "Team Name" ? teamName : sanitizedValue;
    }));

    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
    }

    Logger.log("All sections' data imported successfully.");
  } else {
    Logger.log("No valid data found across sections.");
  }
}

function sanitizeData(value) {
  if (typeof value === "string") { 
    return value
      .replace(/'A'/g, "") // Remove standalone 'A'
      .replace(/'C'/g, "") // Remove standalone 'C'
      .replace(/\(AP\)/g, "") // Remove 'AP' if it's a separate word
      .replace(/É/g, "E") // Replace accented characters
      .replace(/é/g, "e")
      .replace(/ô/g, "o"); 
  }
  
  return value;
}
