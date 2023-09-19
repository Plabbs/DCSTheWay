class ajs37 {
    // Keys (see Mods\aircraft\AJS37\Input\keyboard\default.lua)
    static device = {
        NAVIGATION: 12,
        NAV_PANEL: 23,
    };
    // refactor, remove delay attribute and move to keypadPress

    static keys = {
        0: {device: this.device.NAVIGATION, code: 3020, activate: 1, addDepress: "true"},
        1: {device: this.device.NAVIGATION, code: 3021, activate: 1, addDepress: "true"},
        2: {device: this.device.NAVIGATION, code: 3022, activate: 1, addDepress: "true"},
        3: {device: this.device.NAVIGATION, code: 3023, activate: 1, addDepress: "true"},
        4: {device: this.device.NAVIGATION, code: 3024, activate: 1, addDepress: "true"},
        5: {device: this.device.NAVIGATION, code: 3025, activate: 1, addDepress: "true"},
        6: {device: this.device.NAVIGATION, code: 3026, activate: 1, addDepress: "true"},
        7: {device: this.device.NAVIGATION, code: 3027, activate: 1, addDepress: "true"},
        8: {device: this.device.NAVIGATION, code: 3028, activate: 1, addDepress: "true"},
        9: {device: this.device.NAVIGATION, code: 3029, activate: 1, addDepress: "true"},
        L_MAL: {device: this.device.NAVIGATION, code: 3008, activate: 1, addDepress: "true"},
        LS_SKU: {device: this.device.NAVIGATION, code: 3009, activate: 1, addDepress: "true"},
        Bx: {device: this.device.NAVIGATION, code: 3010, activate: 1, addDepress: "true"},
        B1: {device: this.device.NAVIGATION, code: 3011, activate: 1, addDepress: "true"},
        B2: {device: this.device.NAVIGATION, code: 3012, activate: 1, addDepress: "true"},
        B3: {device: this.device.NAVIGATION, code: 3013, activate: 1, addDepress: "true"},
        B4: {device: this.device.NAVIGATION, code: 3014, activate: 1, addDepress: "true"},
        B5: {device: this.device.NAVIGATION, code: 3015, activate: 1, addDepress: "true"},
        B6: {device: this.device.NAVIGATION, code: 3016, activate: 1, addDepress: "true"},
        B7: {device: this.device.NAVIGATION, code: 3017, activate: 1, addDepress: "true"},
        B8: {device: this.device.NAVIGATION, code: 3018, activate: 1, addDepress: "true"},
        B9: {device: this.device.NAVIGATION, code: 3019, activate: 1, addDepress: "true"},
        MODE_AKT_POS: {device: this.device.NAV_PANEL, code: 3009, activate: 0.6, addDepress: "false"},
        MODE_REF_LOLA: {device: this.device.NAV_PANEL, code: 3009, activate: 0.5, addDepress: "false"},
        MODE_BANA_GRANS: {device: this.device.NAV_PANEL, code: 3009, activate: 0.4, addDepress: "false"},
        MODE_VINDRUTA_MAL: {device: this.device.NAV_PANEL, code: 3009, activate: 0.3, addDepress: "false"},
        MODE_TID: {device: this.device.NAV_PANEL, code: 3009, activate: 0.2, addDepress: "false"},
        MODE_TAKT: {device: this.device.NAV_PANEL, code: 3009, activate: 0.1, addDepress: "false"},
        MODE_ID_NR: {device: this.device.NAV_PANEL, code: 3009, activate: 0.0, addDepress: "false"},
        IN: {device: this.device.NAV_PANEL, code: 3008, activate: 1, addDepress: "false"},
        OUT: {device: this.device.NAV_PANEL, code: 3008, activate: 0, addDepress: "false"},
    };

    static key(key) {
        let keyStroke = this.keys[key];
        keyStroke.delay = 100;
        return keyStroke;
    }

    static createButtonCommands(waypoints) {
        let waypointCounter = 0;
        let payload = [];
        console.log("Creating AJS37 Viggen commands");

        // REF LOLA
        payload.push(this.key("MODE_REF_LOLA"));
        // Input
        payload.push(this.key("IN"));
        for (const waypoint of waypoints) {
            waypointCounter++;
            if (waypointCounter > 9) {
                break;
            }
            // Type in longtitude and latitude together
            for (const char of waypoint.long) {
                payload.push(this.key(char));
            }
            for (const char of waypoint.lat) {
                payload.push(this.key(char));
            }

            // If the waypoint name is in format "Bx(digit)", treat this as Bx point
            if (waypoint.name.toLowerCase().match(/bx\d/)) {
                payload.push(this.key("Bx"));
                // Press the number for the 3rd character
                payload.push(this.key(waypoint.name[2]));
                waypointCounter--;
            } else {
                // Press B(number) for the waypoint number
                payload.push(this.key("B" + waypointCounter));

                // If the name is "Additional" or "M" then convert to target point
                if (waypoint.name.toLowerCase() === "additional" || waypoint.name.toLowerCase() === "m") {
                    payload.push(this.key("MODE_TAKT"));
                    payload.push(this.key("9"));
                    payload.push(this.key("B" + waypointCounter));
                    payload.push(this.key("MODE_REF_LOLA"));
                }
            }
        }

        // Output and switch to position mode
        payload.push(this.key("OUT"));
        payload.push(this.key("MODE_AKT_POS"));
        // log json of payload
        console.log(payload);
        return payload;
    }
}

export default ajs37;
