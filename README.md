# DCSTheWay
Imports waypoints right into the plane navigation system, like a Data Transfer Cartridge.
[DCS Forums thread here](https://forum.dcs.world/topic/272110-transfer-steerpoints-from-the-f10-map-into-the-aircraft-dcs-the-way/)

## What does it do?
You choose points on the DCS F10 map, press a button, and those points will be entered as steerpoints into your plane automatically. 
You can also share those waypoints with your friends, and you will all fly the same route, regardless of the module they choose.

## What is supported?
Supported modules:
* F-15E
* F-16 (& All IDF Mods Project F16s)
* F/A-18C (& Superbug FA-18E/F/G) 
* A-10C and A-10C2
* Mirage 2000
* AV8BNA Harrier
* Ka-50 Blackshark
* AH-64D Apache (Pilot and CP/G)
* Mirage F1EE
* AJS-37 Viggen
* JF-17 Thunder
 
Multiplayer is supported as long as the server has Player Exports turned on (most servers do).

## Special functionality per module

The special functionality is accessed using naming patterns.  <b>They are not case sensitive so "Additional" and "additional" are equivalent.</b>

### Mirage 2000C
* Desired heading<br>If the name of the waypoint is 3 digits (e.g. 090) then it interpreted as desired heading (Route Désirée) which can be seen using the RD button on the PCA top row.
* Creation of offset waypoints (BAD)<br>
Create a waypoint after another and name it "BAD" or "Additional" and then it will be created as an offset for the previous waypoint.  This will enable toss bombing a target using CCRP.
Can also be created directly using shortcut Ctrl+Shift+A

### AJS 37 Viggen
* Waypoints are processed in order and assigned to B1 up to B9  (Shortcut Ctrl+Shift+S)
* Points named "M" or "Additional" are created as target waypoints (Shortcut Ctrl+Shift+A)
* Points named "Bx1" to "Bx9" are created as markpoints (and don't fall into B1-9 range), no shortcut key.

### JF-17 Thunder
* Numbers are extracted from waypoint name (1 to 39).  If no number is found then the previous waypoint number is incremented by 1.
* * 01-29 Normal waypoint  (Ctrl+Shift+A)
* * 30-35 Route point (Steerpoints for anti-ship missiles)
* * 36-39 Pre-planned points (Precision guidance for GPS weapons)
* DTC F10 map naming convention can be used
* * Points named "PP1" to "PP4" or "Additional" are created as pre-planned points (Shortcut Ctrl+Shift+A)
* * Points named "RP1" to "RP6" are created as route points , no shortcut key.
<p> For example list of 4 points named "WPT1", "waypoint2", "3", " " would be created as waypoints 01 to 04

### Calculating QFE (for Viggen and Mirage F1)
For getting the QFE of the target point without a kneeboard, you can use methods mentioned in this video from xxJohnxx [What is QFE?](https://youtu.be/DEovtSLiUsg)
1. On runway, set backup altimeter to show airport's altitude above sea level, its airpressure is now your QNH.
2. Note the altitude of the target, use formulas for ballpark figures:
   * _Meters:_  QFE = QNH - tgt_alt / 9
   * _Feet:_ &nbsp; &nbsp; QFE = QNH - tgt_alt / 30

_Note that these are very rough estimates for QFE._


## How to install?
1. Download the latest zip file from the Releases section, and extract it. 
2. Copy everything in `Scripts` folder from the folder you just extracted into `Users/YourUsername/Saved Games/DCS/Scripts`. The `DCS` folder name may be `DCS.openbeta` if you are on the openbeta version of the game. If you are on Steam, the name will always be just `DCS`.

3. Edit the `Export.lua` file there and append this line at the end of the file, and save it:
  ```lua
  local TheWayLfs=require('lfs'); dofile(TheWayLfs.writedir()..'Scripts/TheWay.lua')
  ```
   If there is no `Export.lua` file already existing there, create it yourself, and it should include only the line above.

4. Run the installer from the zip file you've previously extracted.
5. After installation, the program will launch, and you can go fly! You can find a shortcut to TheWay on your desktop.

If you are updating from an older version, simply download the newest release, rerun the installer and replace your existing Scripts files in Saved Games with the new ones.

## How to use? 
Video tutorial here:

[![DCSTheWayVideoThumbnail](https://img.youtube.com/vi/B2Q1VurZ8ms/default.jpg)](https://youtu.be/B2Q1VurZ8ms)

## FAQ
### I cannot find the installer
Make sure you have downloaded the program from the Releases section, and not the source code.  
### How do I use this for VR?
For VR the main waypoint list is not visible, but everything can be controlled using keybinds:<br>
CTRL+SHIFT+F: Show/Hide crosshair<br>
CTRL+SHIFT+S: to save a point<br>
CTRL+SHIFT+A: to save a point named "Additional"<br>
CTRL+SHIFT+T: to transfer the waypoints<br>
CTRL+SHIFT+D: to delete all waypoints
### I get a "No connection to DCS" error!
Make sure you have followed the install instructions to the letter, and that every file is where it should be.
Check if the server you are flying on has Player Exports turned on. If it doesn't, this won't work! 
### Where is the app installed by default?
TheWay files are installed in Windows at `C:\Users\USER\AppData\Local\Programs\theway`
### How can I reset the module seat choice after I've ticked "Remember my choice"?
Go to `C:\Users\USER\AppData\Roaming\theway` and delete the `config.json` file. Now the dialogs will appear again.

## Credits
This is a fork of 
[DCSTheWay - AronCiucu](https://github.com/aronCiucu/DCSTheWay)

## For nerds
See [README_Technical.md](.\README_Technical)

This is the way.
