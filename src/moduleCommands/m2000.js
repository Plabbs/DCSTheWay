class m2000 {
    static #kuKeycodes = {
        1: 3584,
        2: 3585,
        3: 3586,
        4: 3587,
        5: 3588,
        6: 3589,
        7: 3590,
        8: 3591,
        9: 3592,
        0: 3593,
        BAD: 3576,
        INS: 3596,
        NextWP: 3110,
        ParamSelector: 3574,
        PREP: 3570,
    };
    static #parameter = {
        TR_VS: 0.0,
        D_RLT: 0.1,
        CP_PD: 0.2,
        ALT: 0.3,
        L_G: 0.4,
        RD_TD: 0.5,
        dL_dG: 0.6,
        dALT: 0.7,
        Rho_Theta: 0.8,
        DEC: 0.9,
        DV_FV: 1.0,
    };
    static #codesPayload = [];

    static #addButtonCode(code) {
        this.#codesPayload.push({
            device: 9,
            code: code,
            delay: 100,
            activate: 1,
            addDepress: "true",
        });
    }

    static #addParamSelectorCode(position) {
        this.#codesPayload.push({
            device: 9,
            code: this.#kuKeycodes.ParamSelector,
            delay: 100,
            activate: position,
            addDepress: "false",
        });
    }

    static #addNumpadCodes(numString) {
        for (let i = 0; i < numString.length; i++) {
            const characterCode = this.#kuKeycodes[numString.charAt(i).toLowerCase()];
            if (characterCode !== undefined) this.#addButtonCode(characterCode);
        }
    }

    static #createWaypoint(waypoint) {
        // Parameter selector - Lat/lonG
        this.#addParamSelectorCode(this.#parameter.L_G);
        // "Next Waypoint Button"
        this.#addButtonCode(this.#kuKeycodes.NextWP);
        // PREP * 2 - This will Prep the current Dest waypoint
        this.#addButtonCode(this.#kuKeycodes.PREP);
        this.#addButtonCode(this.#kuKeycodes.PREP);
        // "1" (for left field "Longtitude")
        this.#addNumpadCodes("1");

        //Type hemisphere
        if (waypoint.latHem === "N") {
            this.#addNumpadCodes("2");
        } else {
            this.#addNumpadCodes("8");
        }
        //type latitude + INS
        this.#addNumpadCodes(waypoint.lat);
        this.#addButtonCode(this.#kuKeycodes.INS);
        // "3" (for right field Longtitude)
        this.#addNumpadCodes("3");
        //Type E/W hemisphere
        if (waypoint.longHem === "E") {
            this.#addNumpadCodes("6");
        } else {
            this.#addNumpadCodes("4");
        }
        //type longtitude value + INS
        this.#addNumpadCodes(waypoint.long);
        this.#addButtonCode(this.#kuKeycodes.INS);

        // Parameter selector "ALT"
        this.#addParamSelectorCode(this.#parameter.ALT);
        // 1 - Feet
        this.#addNumpadCodes("1");
        // 1 - Positive
        this.#addNumpadCodes("1");

        //type elevation + INS
        this.#addNumpadCodes(waypoint.elev);
        this.#addButtonCode(this.#kuKeycodes.INS);
    }

    static #addDesiredHeading(degreesTxt) {
        let degreesOut = "";
        // Convert degrees text to output format 0000 where last digit is a decimal
        if (degreesTxt.length === 4) {
            degreesOut = degreesTxt;
        } else {
            degreesOut = parseFloat(degreesTxt).toFixed(1).replace(".","").padStart(4,"0");
        }
        // Set Parameter RD/TD   (Route désirée / Temps désiré)
        this.#addParamSelectorCode(this.#parameter.RD_TD);
        // 1 - Left field (Heading value)
        this.#addNumpadCodes("1");
        // Type the number + INS
        this.#addNumpadCodes(degreesOut);
        this.#addButtonCode(this.#kuKeycodes.INS);
    }

    static #toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    static #parseLatLong(value, hemisphere) {
        let degrees, minutes = 0;

        // Check if value is a string
        if (typeof value === "string") {
            const parts = value.split(".");
            if (parts.length === 3) {
                degrees = parseFloat(parts[0]);
                minutes = parseFloat(parts[1] + "." + parts[2]);
                degrees = degrees + minutes / 60;
            } else if (parts.length === 2) {
                degrees = parseFloat(value);
            } else {
                throw new Error("Invalid format for latitude or longitude");
            }
        }
        // Check if value is a number
        else if (typeof value === "number") {
            degrees = value;
        } else {
            throw new Error("Invalid type for latitude or longitude");
        }

        let radians = this.#toRadians(degrees);
        return hemisphere === 'S' || hemisphere === 'W' ? -radians : radians;
    }

    static #haversineDistance(lat1, long1, lat2, long2) {
        const EARTH_RADIUS = 6371e3; // Earth's mean radius in meters
        let deltaLat = lat2 - lat1;
        let deltaLong = long2 - long1;

        // Because of Caucasus map projection there must be an adjustment to the distances so that
        // they match the distance-per-degree on the F10 map.  Since I don't know exactly how the
        // projection formula works, I estimate rough multiplication factors per latitude and longtitude
        // derived by taking measurements on the F10 map compared with calculated distances.
        // Map boundary: N 40 - 45.38 and E28 - E46
        if (lat1 > 0.6981317 && lat1 < 0.79645 && long1 > 0.48869 && long1 < 0.802851) {
            deltaLat = deltaLat * 1.006;
            deltaLong = deltaLong * 1.01;
        }

        const a = Math.pow(Math.sin(deltaLat / 2), 2) +
                  Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLong / 2), 2);
        const c = 2 * Math.atan(Math.sqrt(a));

        return EARTH_RADIUS * c;
    }

    static #getWPDeltaMeters(waypoint1, waypoint2) {
        // Convert lat/long to radians
        let lat1 = this.#parseLatLong(waypoint1.lat, waypoint1.latHem);
        let long1 = this.#parseLatLong(waypoint1.long, waypoint1.longHem);
        let lat2 = this.#parseLatLong(waypoint2.lat, waypoint2.latHem);
        let long2 = this.#parseLatLong(waypoint2.long, waypoint2.longHem);

        // Calculate N/S component and E/W components
        let latDistance = this.#haversineDistance(lat1, long1, lat2, long1);
        let longDistance = this.#haversineDistance(lat1, long1, lat1, long2);
        // Adjust sign by hemisphere
		latDistance = lat1 > lat2 ? -latDistance : latDistance;
		longDistance = long1 > long2 ? -longDistance : longDistance;

        let altDifference = parseFloat(waypoint2.elev) - parseFloat(waypoint1.elev);

        return {
            latMeters: latDistance,
            longMeters: longDistance,
            altitudeDifference: altDifference,
        };
    }

    static #createBAD(waypoint, lastWaypoint) {
        // Find delta between coordinates in angle, distance and altitude (°, nm, feet)
        const delta = this.#getWPDeltaMeters(lastWaypoint, waypoint);
        // Convert the calculated values to formatted values ready for typing into UNI
        const deltaOut = {
            latOffset: Math.abs(delta.latMeters).toFixed(0).padStart(5, "0"),
            latDirKey: delta.latMeters >= 0 ? "2" : "8",
            longOffset: Math.abs(delta.longMeters).toFixed(0).padStart(5, "0"),
            longDirKey: delta.longMeters >= 0 ? "6" : "4",
            altitudeDifference: Math.abs(delta.altitudeDifference).toFixed(0).padStart(5, "0"),
            altitudeSignKey: delta.altitudeDifference >= 0 ? "1" : "7",
        };
        // Set Parameter to BAD - ΔL/ΔG
        this.#addParamSelectorCode(this.#parameter.dL_dG);
        // 1 - Left field (N/S offset meters)
        this.#addNumpadCodes("1");
        // Direction
        this.#addNumpadCodes(deltaOut.latDirKey);
        // Type the number + INS
        this.#addNumpadCodes(deltaOut.latOffset);
        this.#addButtonCode(this.#kuKeycodes.INS);

        // 3 - Right field (E/W offset meters)
        this.#addNumpadCodes("3");
        // Direction
        this.#addNumpadCodes(deltaOut.longDirKey);
        // Type the number + INS
        this.#addNumpadCodes(deltaOut.longOffset);
        this.#addButtonCode(this.#kuKeycodes.INS);

        // Set Parameter to BAD - delta ALT
        this.#addParamSelectorCode(this.#parameter.dALT);
        // Select feet and +/- symbol
        this.#addNumpadCodes("1");
        this.#addNumpadCodes(deltaOut.altitudeSignKey);
        // Type the number for altitude + INS
        this.#addNumpadCodes(deltaOut.altitudeDifference);
        this.#addButtonCode(this.#kuKeycodes.INS);
    }

    static createButtonCommands(waypoints) {
        this.#codesPayload = [];
        let previousWP = null;
        for (const waypoint of waypoints) {
            // If the waypoint name = "BAD" then create a Waypoint Offset (BAD - "But Additionnel")
            // attached to the previous waypoint, but if no previous waypoint provided then create as normal waypoint
            if (waypoint.name.toUpperCase() === "BAD" && previousWP !== null) {
                this.#createBAD(waypoint, previousWP);
                previousWP = null;
            } else {
                this.#createWaypoint(waypoint);
                previousWP = waypoint;

                // Check if waypoint name is in any of the digit formats for Desired Heading
                // "ddd", "dddd", "ddd.d"
                if (/^(\d{4}|\d{3}(\.\d)?|)$/.test(waypoint.name)) {
                    this.#addDesiredHeading(waypoint.name);
                }
            }
        }
        return this.#codesPayload;
    }
}

export default m2000;
