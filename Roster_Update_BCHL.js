function RosterUpdateBCHL() {
  const teamIds = [
    8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 39, 81, 82, 87, 88, 89
  ];

  teamIds.forEach((teamId, index) => {
    const isFirstTeam = index === 0;
    const url = `https://lscluster.hockeytech.com/feed/index.php?feed=statviewfeed&view=roster&team_id=${teamId}&season_id=62&rosterstatus=1&key=f3ed30007ad2124e&client_code=bchl&site_id=1&league_id=1&lang=en`;
    NewRosterCSV(url, "Roster_Update_BCHL", isFirstTeam);
  });
}

function NewRosterCSV(url, sheetName, cleanSheet) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadSheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log(`Sheet '${sheetName}' not found.`);
    return;
  }

  if (cleanSheet) sheet.clear();

  try {
    const response = UrlFetchApp.fetch(url);
    let jsonData = response.getContentText();

    // Remove unnecessary parentheses around JSON
    if (jsonData.startsWith("(") && jsonData.endsWith(")")) {
      jsonData = jsonData.slice(1, -1);
    }

    const parsedData = JSON.parse(jsonData);
    const teamName = parsedData.teamName || "Unknown";

    const allData = (parsedData.roster || []).flatMap(section =>
      (section.sections || []).flatMap(subSection => subSection.data || [])
    );

    if (!allData.length) {
      Logger.log("No valid data found.");
      return;
    }

    let headers = Object.keys(allData[0].row || {});
    if (!headers.includes("Team Name")) headers.push("Team Name");

    const existingHeaders = sheet.getLastRow() > 0 ?
      sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];

    if (!existingHeaders.length || existingHeaders.join() !== headers.join()) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const rows = allData.map(item => headers.map(header =>
      header === "Team Name" ? teamName : sanitizeData(item.row[header] || "")
    ));

    if (rows.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
    }

    Logger.log("Roster data imported successfully.");
  } catch (error) {
    Logger.log(`Error fetching data: ${error.message}`);
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