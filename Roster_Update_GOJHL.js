function RosterUpdateGOJHL() {
  const teamIds = [2, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 16, 17, 19, 20, 22];
  const urlBase = "https://lscluster.hockeytech.com/feed/index.php?feed=statviewfeed&view=roster&season_id=93&rosterstatus=1&key=34b10d4d34d7b59a&client_code=gojhl&site_id=2&league_id=1&lang=en";
  const sheetName = "Roster_Update_GOJHL";

  teamIds.forEach(teamId => {
    const url = `${urlBase}&team_id=${teamId}`;
    const isCleanSheet = teamId === 2; // Clean the sheet for the first team only
    NewRosterCSV(url, sheetName, isCleanSheet);
  });
}

function NewRosterCSV(urlParameter, sheetName, cleanSheet) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadSheet.getSheetByName(sheetName);
  
  if (cleanSheet) {
    sheet.clear();
  }

  // Fetch and parse JSON content
  const response = UrlFetchApp.fetch(urlParameter);
  let jsonData = response.getContentText();

  // Clean the JSON (remove first and last parentheses)
  if (jsonData.startsWith("(") && jsonData.endsWith(")")) {
    jsonData = jsonData.slice(1, -1);
  }

  const parsedData = JSON.parse(jsonData);
  const teamName = parsedData.teamName; // Extract the team name

  // Combine all data from all sections
  const allData = (parsedData.roster || []).reduce((acc, section) => {
    if (Array.isArray(section.sections)) {
      section.sections.forEach(subSection => {
        if (Array.isArray(subSection.data)) {
          acc.push(...subSection.data);
        }
      });
    }
    return acc;
  }, []);

  if (allData.length > 0) {
    const headers = Object.keys(allData[0].row);
    if (!headers.includes("Team Name")) {
      headers.push("Team Name");
    }

    const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    if (existingHeaders.length === 0 || existingHeaders.join() !== headers.join()) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const rows = allData.map(item => {
      return headers.map(header => {
        const originalValue = item.row[header] || "";
        const sanitizedValue = sanitizeData(originalValue); // Using the provided sanitizeData function
        return header === "Team Name" ? teamName : sanitizedValue;
      });
    });

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
