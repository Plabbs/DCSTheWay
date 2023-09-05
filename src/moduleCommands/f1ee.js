class f1ee {
    // INS keypad keys (see Mods\aircraft\Mirage-F1\Input\Mirage-F1EE\default.lua)
    static keys = {
        1: 3698, // -
        2: 3699, // N
        3: 3700, // +
        4: 3701, // W
        5: 3702,
        6: 3703, // E
        7: 3704,
        8: 3705, // S
        9: 3706,
        0: 3697,
        ASTERISK: 3708, // *
        CLR: 3707,                
        INSER: 3711,  // Insert
        VERTICAL: 3709, // Vertical designation
        VALID: 3710,  // Validation
        MODE: 3692,    // Mode knob
        PARAM: 3690,   // Parameter knob
        WAYPOINT: 3694,  // Waypoint wheel
    };
    static modes = {
        SEC: 0,  // Secours (emergency)
        NAV: 0.125, // Navigation
        ALN: 0.25, // Alignment
        ALR: 0.375, // Rapid alignment
        ALCM: 0.5, // Fast alignment with memorized heading
        TEST: 0.625, // Test
        CAL: 0.75, // Calibration
        VEI: 0.875, // Standby (veille)
        AR: 1.0, // Off (arrêt)
    };
    static param = { // Delta = 0.1 with 6 positions
        POS: 0, // Position of the waypoint on selection wheel
        DLDG: 0.1, // Distance to next waypoint
        PP: 0.2, // Present position
        VS_RT: 0.3, // Ground Speed / True Heading (Vitesse au Sol / Route)
        STS: 0.4, // Status

    };
    static waypoint = {
        INCR: 0.111, // Increment waypoint by one step
        DECR: -0.111, // Decrement waypoint by one step
    };

    static keypadPress = function (key, value = 1, depress = true) {
        switch (key) {
            case "MODE":
                return {
                    device: 1,
                    code: this.keys[key],
                    delay: 100,
                    activate: this.modes[value],
                    addDepress: depress ? "true" : "false",
                };
            case "PARAM":
                return {
                    device: 1,
                    code: this.keys[key],
                    delay: 100,
                    activate: this.param[value],
                    addDepress: depress ? "true" : "false",
                };
            case "WAYPOINT":
                return {
                    device: 1,
                    code: this.keys[key],
                    delay: 100,
                    activate: this.waypoint[value],
                    addDepress: depress ? "true" : "false",
                };
            default:
                return {
                    device: 1,
                    code: this.keys[key],
                    delay: 100,
                    activate: value,
                    addDepress: depress ? "true" : "false",
                };
        }
    };

    static createButtonCommands(waypoints) {
        console.log("Creating F1EE commands");
        let payload = [
            //Mode NAV
            this.keypadPress("MODE", "NAV", false),
            //Parameter POS
            this.keypadPress("PARAM", "POS", false),
        ];

        for (const waypoint of waypoints) {
            //Increment waypoint
            payload.push(this.keypadPress("WAYPOINT", "INCR", false));

            //Hemisphere
            if (waypoint.latHem === "N") {
                payload.push(this.keypadPress(2));
            } else {
                payload.push(this.keypadPress(8));
            }

            //Latitude
            for (const c of waypoint.lat) {
                if (isNaN(c)) continue;
                payload.push(this.keypadPress(parseInt(c)));
            }

            //Insert
            payload.push(this.keypadPress("INSER"));

            //Hemisphere
            if (waypoint.longHem === "E") {
                payload.push(this.keypadPress(6));
            } else {
                payload.push(this.keypadPress(4));
            }

            //Longitude
            for (const c of waypoint.long) {
                if (isNaN(c)) continue;
                payload.push(this.keypadPress(parseInt(c)));
            }

            //Insert
            payload.push(this.keypadPress("INSER"));
        }

        //Parameter PP
        payload.push(this.keypadPress("PARAM", "PP", false));
        return payload;
    }
}

export default f1ee;
