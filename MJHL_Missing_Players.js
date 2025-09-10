function appendMissingPlayersMJHL() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mjhlSheet = ss.getSheetByName("MJHL");
  const rosterSheet = ss.getSheetByName("Roster_Update_MJHL");

  if (!mjhlSheet || !rosterSheet) {
    Logger.log("One or both sheets not found.");
    return;
  }

  const mjhlData = mjhlSheet.getDataRange().getValues();
  const rosterData = rosterSheet.getDataRange().getValues();

  if (mjhlData.length === 0 || rosterData.length === 0) {
    Logger.log("One of the sheets is empty.");
    return;
  }

  // Extract player names from MJHL (Column E, index 4)
  const mjhlPlayers = new Set(mjhlData.map(row => row[4]?.toString().trim().toLowerCase())); 

  let newPlayers = [];
  for (let i = 0; i < rosterData.length; i++) {
    const playerName = rosterData[i][0]?.toString().trim().toLowerCase(); // Column A (index 0)
    const playerPosition = rosterData[i][1]?.toString().trim().toUpperCase(); // Column B (index 1)

    // Skip goalies
    if (playerPosition === "G") {
      continue;
    }

    // Ensure all columns B-I (indexes 1 to 8) have values
    const hasAllData = rosterData[i].slice(1, 9).every(value => value !== "" && value !== null);
    if (!hasAllData) {
      continue; // Skip if any column in B-I is empty
    }

    // Append player if they are not in MJHL
    if (playerName && !mjhlPlayers.has(playerName)) {
      let rowData = new Array(4).fill(""); // Empty columns A-D
      rowData = rowData.concat(rosterData[i].slice(0, 9)); // Append columns A-I
      newPlayers.push(rowData);
    }
  }

  if (newPlayers.length > 0) {
    mjhlSheet.getRange(mjhlData.length + 1, 1, newPlayers.length, newPlayers[0].length)
             .setValues(newPlayers);
    Logger.log(`${newPlayers.length} new players added.`);
  } else {
    Logger.log("No new players found.");
  }
}
