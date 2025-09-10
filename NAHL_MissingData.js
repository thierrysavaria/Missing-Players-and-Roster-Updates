function updateNAHLSheet() {
  // Get the active spreadsheet and the two sheets
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nahlSheet = ss.getSheetByName("NAHL");
  var missingPlayersSheet = ss.getSheetByName("NAHL_Missing_Players");

  // Get the data from both sheets
  var nahlData = nahlSheet.getDataRange().getValues();
  var missingPlayersData = missingPlayersSheet.getDataRange().getValues();
  
  // Create a map for the names in the "NAHL_Missing_Players" sheet for quick lookup
  var missingPlayersMap = {};
  for (var i = 1; i < missingPlayersData.length; i++) {
    var playerName = missingPlayersData[i][1];  // Now player names are in column B (index 1)
    if (playerName) {
      missingPlayersMap[playerName] = missingPlayersData[i].slice(5, 9); // Get columns F, G, H, I (index 5, 6, 7, 8)
    }
  }

  // Loop through each row in the "NAHL" sheet
  for (var i = 1; i < nahlData.length; i++) {
    var nahlPlayerName = nahlData[i][4];  // Now player names are in column E (index 4)
    
    // Check if the player exists in the missing players map and if columns H-K are empty
    if (missingPlayersMap[nahlPlayerName] && !nahlData[i][7] && !nahlData[i][8] && !nahlData[i][9] && !nahlData[i][10]) {
      // Get the data to append (columns F, G, H, I from "NAHL_Missing_Players")
      var playerInfo = missingPlayersMap[nahlPlayerName];
      
      // Append data to the "NAHL" sheet columns H, I, J, K
      nahlSheet.getRange(i + 1, 8).setValue(playerInfo[0]); // Column H
      nahlSheet.getRange(i + 1, 9).setValue(playerInfo[1]); // Column I
      nahlSheet.getRange(i + 1, 10).setValue(playerInfo[2]); // Column J
      nahlSheet.getRange(i + 1, 11).setValue(playerInfo[3]); // Column K
    }
  }
}
