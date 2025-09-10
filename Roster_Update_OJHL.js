function RosterUpdateOJHL() {
  var teamIds = [8, 12, 13, 14, 15, 17, 19, 21, 25, 26, 27, 28, 29, 30, 31, 39]; // List of team IDs
  var sheetName = "Roster_Update_OJHL";
  
  for (var i = 0; i < teamIds.length; i++) {
    var teamId = teamIds[i];
    var url = "https://lscluster.hockeytech.com/feed/index.php?feed=statviewfeed&view=roster&team_id=" + teamId + "&season_id=29&key=77a0bd73d9d363d3&client_code=ojhl&site_id=2&league_id=1&lang=en";
    NewRosterCSV(url, sheetName, i === 0); // Only clear the sheet for the first team
  }
}

function NewRosterCSV(urlParameter, sheetName, cleanSheet) {
  var url = urlParameter;
  Logger.log(url);
  Logger.log(sheetName);
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  
  if (cleanSheet == true) {
    sheet.clear();
  }

  // Fetch JSON content
  var response = UrlFetchApp.fetch(url);
  var jsonData = response.getContentText();
  
  // Remove first and last parentheses if present
  if (jsonData.startsWith("(") && jsonData.endsWith(")")) {
    jsonData = jsonData.slice(1, -1);
  }
  
  // Parse the cleaned JSON
  var parsedData = JSON.parse(jsonData);
  var teamName = parsedData.teamName; // Extract the team name

  // Combine data from all sections
  var allData = [];
  if (parsedData.roster && Array.isArray(parsedData.roster)) {
    parsedData.roster.forEach(function(section, index) {
      if (!section.sections || !Array.isArray(section.sections)) {
        Logger.log("Skipping roster section at index " + index + " because 'sections' is missing or not an array.");
        return;
      }

      section.sections.forEach(function(subSection, subIndex) {
        if (!subSection.data || !Array.isArray(subSection.data)) {
          Logger.log("Skipping subsection at index " + subIndex + " because 'data' is missing or not an array.");
          return;
        }

        allData = allData.concat(subSection.data);
      });
    });
  }

  if (allData.length > 0) {
    var headers = Object.keys(allData[0].row);

    // Add 'Team Name' to headers if not already present
    if (!headers.includes("Team Name")) {
      headers.push("Team Name");
    }

    var existingHeaders = [];
    if (sheet.getLastRow() > 0 && sheet.getLastColumn() > 0) {
      existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }

    if (existingHeaders.length === 0 || existingHeaders.join() !== headers.join()) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    var rows = allData.map(function (item) {
      return headers.map(function (header) {
        let originalValue = item.row[header] || "";
        let sanitizedValue = sanitizeData(originalValue);
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
