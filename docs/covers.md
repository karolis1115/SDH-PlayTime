## 🎮 Custom Covers for Non-Steam Games

> [!CAUTION]  
> **Minimum Decky version required: 3.1.6**

Follow these steps to set custom cover art for your Non-Steam games using the PlayTime plugin.

---

### ✅ Step-by-Step Instructions

1. **Open Quick Access Menu**  
   Press the Quick Access button on your Steam Deck.

2. **Launch the PlayTime Plugin**  
   Navigate to and open the **PlayTime** plugin from the menu.

3. **Go to Detailed Report**  
   Inside PlayTime, select **Detailed Report** to view your game library.

4. **Select Your Game**  
   Scroll and focus on the Non-Steam game you want to customize.

5. **Open Options**  
   Click the **Option** button next to the game entry.

6. **Note the Game ID**  
   You’ll see a header line like:  
   `FIFA 17 (ID: 2489841875)`  
   
   > 💡 *Steam generates a unique ID for each Non-Steam game. Yours will differ from this example.*

7. **Find Your Cover Art**  
   Search online for the cover image you’d like to use.
   You can use [SteamGridDB](https://www.steamgriddb.com/).

8. **Download the Image**  
   Save it in either `.png` or `.jpg` format — **these are the only supported types**.

9. **Rename the File**  
   Rename the image file to match your game’s ID:  
   - Example: `2489841875.png` or `2489841875.jpg`

10. **Place the File in the Correct Folder**  
    Copy the renamed image into this directory:  
    ```
    /home/deck/homebrew/data/SDH-PlayTime/assets/
    ```

    > ⚠️ If the `assets` folder doesn't exist inside `SDH-PlayTime`, **create it manually**.

### ✅ Done!
Restart **PlayTime** plugin or Steam Deck *if restarting plugin doesn't help* — your custom cover should now appear for that game.
