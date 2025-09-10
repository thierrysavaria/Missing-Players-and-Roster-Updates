function Roster_Update () {
  NewRosterCSV ("https://api.nahl.tts.h22s.net/get_roster?auth_key=nahl_league_sites&auth_timestamp=1742584728&body_md5=d41d8cd98f00b204e9800998ecf8427e&league_id=4&season_id=142&team_id=592&stat_class=7&auth_signature=f7ce96ef49afc6c67936914c17f65dfc6cb4f2fe9f496ac5ddafa1e49724ba95", "Roster_Update_NAHL", true);
  NewRosterCSV("https://api.nahl.tts.h22s.net/get_roster?auth_key=nahl_league_sites&auth_timestamp=1742584783&body_md5=d41d8cd98f00b204e9800998ecf8427e&league_id=4&season_id=142&team_id=593&stat_class=7&auth_signature=ad6f1c7464d83e150c43a2c7891ba789b69ec67e33f351299dfc98605535a547", "Roster_Update_NAHL", false);

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
        // Logger.log("Before sanitization: " + originalValue);
        let sanitizedValue = sanitizeData(originalValue);
        // Logger.log("After sanitization: " + sanitizedValue);
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
}}


