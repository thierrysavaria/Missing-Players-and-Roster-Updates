function RosterUpdateUSHL() {
  const teamIds = [8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  const baseUrl = "https://lscluster.hockeytech.com/feed/index.php?feed=statviewfeed&view=roster&season_id=85&key=e828f89b243dc43f&client_code=ushl&site_id=0&league_id=1&team_id=";
  
  teamIds.forEach((id, index) => {
    NewRosterCSV(`${baseUrl}${id}`, "Roster_Update_USHL", index === 0);
  });
}

function NewRosterCSV(urlParameter, sheetName, cleanSheet) {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  
  if (cleanSheet) {
    sheet.clear();
  }

  var response = UrlFetchApp.fetch(urlParameter);
  var jsonData = response.getContentText();
  
  if (jsonData.startsWith("(") && jsonData.endsWith(")")) {
    jsonData = jsonData.slice(1, -1);
  }
  
  var parsedData = JSON.parse(jsonData);
  var teamName = parsedData.teamName;
  var allData = [];
  
  if (parsedData.roster && Array.isArray(parsedData.roster)) {
    parsedData.roster.forEach(section => {
      if (!section.sections || !Array.isArray(section.sections)) return;
      section.sections.forEach(subSection => {
        if (!subSection.data || !Array.isArray(subSection.data)) return;
        allData = allData.concat(subSection.data);
      });
    });
  }

  if (allData.length > 0) {
    var headers = Object.keys(allData[0].row);
    if (!headers.includes("Team Name")) headers.push("Team Name");
    
    var existingHeaders = [];
    if (sheet.getLastRow() > 0 && sheet.getLastColumn() > 0) {
      existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }
    
    if (existingHeaders.length === 0 || existingHeaders.join() !== headers.join()) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    var rows = allData.map(item => 
      headers.map(header => header === "Team Name" ? teamName : sanitizeData(item.row[header] || ""))
    );
    
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
    }
  }
}

function sanitizeData(value) {
  if (typeof value === "string") { 
    return value
      .replace(/'A'/g, "")
      .replace(/'C'/g, "")
      .replace(/\(AP\)/g, "")
      .replace(/É/g, "E")
      .replace(/é/g, "e")
      .replace(/ô/g, "o"); 
  }
  return value;
}