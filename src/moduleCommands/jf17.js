class jf17 {
    // \Mods\aircraft\JF-17\Cockpit\Scripts\command_defs.lua  - PNT_xxx = xxx + 2502
    // \Mods\aircraft\JF-17\Cockpit\Scripts\devices.lua
    static device = {
        UFCP: 46,
    };

    static keys = {
        1: {device: this.device.UFCP, code: 3202, delay: 100, activate: 1, addDepress: "true"}, // PNT_700 = "UFCP Button PFL/1"
        2: {device: this.device.UFCP, code: 3203, delay: 100, activate: 1, addDepress: "true"}, // PNT_701 = "UFCP Button VRC/2"
        3: {device: this.device.UFCP, code: 3204, delay: 100, activate: 1, addDepress: "true"}, // PNT_702 = "UFCP Button 3"
        L1: {device: this.device.UFCP, code: 3205, delay: 100, activate: 1, addDepress: "true"}, // PNT_703 = "UFCP Button L1"
        R1: {device: this.device.UFCP, code: 3206, delay: 100, activate: 1, addDepress: "true"}, // PNT_704 = "UFCP Button R1"
        OAP: {device: this.device.UFCP, code: 3207, delay: 100, activate: 1, addDepress: "true"}, // PNT_705 = "UFCP Button OAP"
        MRK: {device: this.device.UFCP, code: 3208, delay: 100, activate: 1, addDepress: "true"}, // PNT_706 = "UFCP Button MRK"
        4: {device: this.device.UFCP, code: 3209, delay: 100, activate: 1, addDepress: "true"}, // PNT_707 = "UFCP Button DST/4"
        5: {device: this.device.UFCP, code: 3210, delay: 100, activate: 1, addDepress: "true"}, // PNT_708 = "UFCP Button TOT/5"
        6: {device: this.device.UFCP, code: 3211, delay: 100, activate: 1, addDepress: "true"}, // PNT_709 = "UFCP Button TOD/6"
        L2: {device: this.device.UFCP, code: 3212, delay: 100, activate: 1, addDepress: "true"}, // PNT_710 = "UFCP Button L2"
        R2: {device: this.device.UFCP, code: 3213, delay: 100, activate: 1, addDepress: "true"}, // PNT_711 = "UFCP Button R2"
        P_U: {device: this.device.UFCP, code: 3214, delay: 100, activate: 1, addDepress: "true"}, // PNT_712 = "UFCP Button P.U"
        HNS: {device: this.device.UFCP, code: 3215, delay: 100, activate: 1, addDepress: "true"}, // PNT_713 = "UFCP Button HNS"
        7: {device: this.device.UFCP, code: 3216, delay: 100, activate: 1, addDepress: "true"}, // PNT_714 = "UFCP Button FUL/7"
        8: {device: this.device.UFCP, code: 3217, delay: 100, activate: 1, addDepress: "true"}, // PNT_715 = "UFCP Button IFF/8"
        9: {device: this.device.UFCP, code: 3218, delay: 100, activate: 1, addDepress: "true"}, // PNT_716 = "UFCP Button 9"
        L3: {device: this.device.UFCP, code: 3219, delay: 100, activate: 1, addDepress: "true"}, // PNT_717 = "UFCP Button L3"
        R3: {device: this.device.UFCP, code: 3220, delay: 100, activate: 1, addDepress: "true"}, // PNT_718 = "UFCP Button R3"
        A_P: {device: this.device.UFCP, code: 3221, delay: 100, activate: 1, addDepress: "true"}, // "UFCP Button A/P"
        FPM: {device: this.device.UFCP, code: 3222, delay: 100, activate: 1, addDepress: "true"}, // PNT_720 = "UFCP Button FPM"
        RTN: {device: this.device.UFCP, code: 3223, delay: 100, activate: 1, addDepress: "true"}, // PNT_721 = "UFCP Button RTN"
        0: {device: this.device.UFCP, code: 3224, delay: 100, activate: 1, addDepress: "true"}, // PNT_722 = "UFCP Button 0"
        L4: {device: this.device.UFCP, code: 3226, delay: 100, activate: 1, addDepress: "true"}, // PNT_724 = "UFCP Button L4"
        R4: {device: this.device.UFCP, code: 3227, delay: 100, activate: 1, addDepress: "true"}, // PNT_725 = "UFCP Button R4"
    };

    static key(key) {
        let keyStroke = this.keys[key];
        keyStroke.delay = 100;
        return keyStroke;
    }

    static createButtonCommands(waypoints) {
        let waypointCounter = 0;
        let plannedPointCounter = 36;
        let wpt_num = 0;
        let waypointString = "";
        let payload = [];
        let usedSlots = [];
        console.log("Creating JF-17 commands");

        // Initialize UFCP by pressing return and Destinations screen "DST/4"
        payload.push(this.key("RTN"));
        payload.push(this.key("4"));
        for (const waypoint of waypoints) {
            console.log(waypoint);
            // Get the number from the name, ignoring all non-digit characters
            wpt_num = parseInt(waypoint.name.replace(/\D/g, ""));
            if (wpt_num === 0) {
                waypointCounter++;
                if (waypointCounter > 29) {
                    // We've reached the end of the available slots, stop automatically assigned numbers
                    continue;
                }
                wpt_num = waypointCounter;
            }
            if (wpt_num <= 29) {
                waypointCounter = wpt_num;
            } else if (wpt_num >= 30 && wpt_num <= 35) {
                
            }
            // Special handling for pre-planned points and Route-points
            if (waypoint.name.toLowerCase().match(/rp\d/)) {
                wpt_num += 29;
                if (wpt_num > 35 || wpt_num < 30) {
                    // illegal point number, skip this waypoint
                    continue;
                }
            } else if (waypoint.name.toLowerCase().match(/pp\d/)) {
                wpt_num += 35;
                if (wpt_num > 39 || wpt_num < 36) {
                    // illegal point number, skip this waypoint
                    continue;
                }
            } else if (waypoint.name.toLowerCase().match(/additional/)) {
                wpt_num = plannedPointCounter;
                plannedPointCounter++;
            }
            // Convert to a string with leading zeroes
            waypointString = wpt_num.toString().padStart(2, "0");
            usedSlots.push(wpt_num);

            // Enter the number into the UFCP
            payload.push(this.key("R1"));
            payload.push(this.key(waypointString[0]));
            payload.push(this.key(waypointString[1]));
            payload.push(this.key("R1"));

            // Type in latitude
            payload.push(this.key("L2"));
            waypoint.lat = waypoint.lat.replace(/\D/g, "");
            for (const char of waypoint.lat) {
                payload.push(this.key(char));
            }
            payload.push(this.key("L2"));
            if (waypoint.longHem === "S") {
                payload.push(this.key("R2"));
            }

            // Type in longitude
            payload.push(this.key("L3"));
            waypoint.long = waypoint.long.replace(/\D/g, "");
            for (const char of waypoint.long) {
                payload.push(this.key(char));
            }
            payload.push(this.key("L3"));
            if (waypoint.longHem === "W") {
                payload.push(this.key("R3"));
            }

            // Type in elevation
            payload.push(this.key("R4"));
            for (const char of waypoint.elev.padStart(5, "0")) {
                payload.push(this.key(char));
            }
            payload.push(this.key("R4"));
        }
        payload.push(this.key("RTN"));

        // log json of payload
        console.log(payload);
        return payload;
    }
}

export default jf17;
