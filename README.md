# Hockey Roster Management & Data Automation

This repository contains a set of Google Apps Script files designed to automate the process of collecting, updating, and synchronizing hockey player rosters and statistics for multiple junior leagues.

The scripts work together to ensure your Google Sheet has a comprehensive and up-to-date roster for each league by fetching data from the HockeyTech network and cross-referencing it against your existing player lists.

---

## Features

- **Automated Roster Updates**  
  Scripts can be set up to run automatically, pulling the latest roster data from the HockeyTech API for specific leagues.

- **Missing Player Identification**  
  Functions are included to compare a newly fetched roster against a separate stats sheet, identifying and appending any players who are on the official roster but are missing from your stats database.

- **Multi-League Support**  
  Separate scripts are provided for various leagues, including:  
  - **Roster Updates**: AJHL, BCHL, CCHL, MHL, MJHL, NOJHL, OJHL, USHL  
  - **Missing Player Check**: AJHL, BCHL, CCHL, MHL, MJHL , NOJHL, OJHL, USHL 

- **Data Handling**  
  Scripts include functions to parse raw JSON data and write it cleanly to a Google Sheet.

---

## How to Use

1. **Create a Google Sheet**  
   Open a new Google Sheet and create a tab for each league's data you want to manage.  
   For example, to use the AJHL scripts, you would create two tabs:  
   - `Roster_Update_AJHL`  
   - `AJHL`

2. **Create an Apps Script Project**  
   From your Google Sheet, go to **Extensions > Apps Script** and start a new project.

3. **Copy the Code**  
   Copy the contents of the relevant `.js` files from this repository into your Apps Script project.  
   For best practice, you may want to create separate files within Apps Script for each file from this repository (e.g., `Roster_Update_AJHL.js`, `AJHL_Missing_Players.js`).

4. **Set up Triggers**  
   To automate the updates, go to the **Triggers section** (the clock icon) in your Apps Script project and set up a time-driven trigger for the main functions (e.g., `RosterUpdateAJHL`, `appendMissingPlayersAJHL`).

---

## File Breakdown

### Roster Update Scripts
- `Roster_Update_AJHL.js`  
- `Roster_Update_BCHL.js`
- `Roster_Update_CCHL.js`
- `Roster_Update_MHL.js`
- `Roster_Update_MJHL.js`  
- `Roster_Update_NOJHL.js`  
- `Roster_Update_OJHL.js`  
- `Roster_Update_USHL.js`  

These files contain the core logic for fetching player roster data from the HockeyTech API and writing it to the corresponding Google Sheet tabs.

### Missing Player Scripts
- `AJHL_Missing_Players.js`  
- `BCHL_Missing_Players.js`  
- `CCHL_Missing_Players.js`  
- `MHL_Missing_Players.js`  
- `MJHL_Missing_Players.js`
- `NOJHL_Missing_Players.js`
- `OJHL_Missing_Players.js`
- `USHL_Missing_Players.js`

These files are designed to be run after a roster update.  
They compare the updated roster sheet with a separate league stats sheet and append any new players found on the roster to the stats sheet.

---

## Disclaimer

Please note that these scripts rely on the specific JSON structure of the HockeyTech API.  
If the API changes its data format, the scripts may break and require updates.

---

## Contributing

I welcome contributions to this project! If you have any ideas for new features, bug fixes, or improvements, please feel free to open a pull request.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE.md](LICENSE.md) file for details.

---

## Contact

**Thierry Savaria**  
GitHub: [thierrysavaria](https://github.com/thierrysavaria)
