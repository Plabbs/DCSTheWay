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
            degreesOut = parseFloat(degreesTxt).toFixed(1).replace(".", "").padStart(4, "0");
        }
        // Set Parameter RD/TD   (Route désirée / Temps désiré)
        this.#addParamSelectorCode(this.#parameter.RD_TD);
        // 1 - Left field (Heading value)
        this.#addNumpadCodes("1");
        // Type the number + INS
        this.#addNumpadCodes(degreesOut);
        this.#addButtonCode(this.#kuKeycodes.INS);
    }

    static #getWPDeltaMeters(waypoint1, waypoint2) {
        // Calculate the Meters difference using the X/Z coordinates
        let latDistance = parseFloat(waypoint2.x) - parseFloat(waypoint1.x);
        let longDistance = parseFloat(waypoint2.z) - parseFloat(waypoint1.z);

        let altDifference = parseFloat(waypoint2.elev) - parseFloat(waypoint1.elev);

        return {
            latMeters: latDistance,
            longMeters: longDistance,
            altitudeDifference: altDifference,
        };
    }

    static #createBAD(offsetPoint, lastWaypoint) {
        // Find delta between coordinates in meters x/y
        const delta = this.#getWPDeltaMeters(lastWaypoint, offsetPoint);
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
        let waypointCollection = [];

        // We need to know in advance if a waypoint has an offset so that the desired heading can be set
        // so we need to create a new list of waypoints along with the corresponding offset
        let waypointWithOffset = { waypoint: null, offset: null, heading: null };
        for (const waypoint of waypoints) {
            // Determine offset waypoints by start of name
            let isOffset =
                waypoint.name.toUpperCase() === "BAD" ||
                waypoint.name.toUpperCase().substring(0,10) === "ADDITIONAL";
            // If the waypoint is not an offset waypoint or the previous waypoint has not been set yet
            if (!isOffset || waypointWithOffset.waypoint === null) {
                // Normal waypoint
                // First save the previous waypoint if it exists
                if (waypointWithOffset.waypoint !== null) {
                    waypointCollection.push(waypointWithOffset);
                }
                // Then set the current waypoint in a new object
                waypointWithOffset = { waypoint: waypoint, offset: null, heading: null };
                // Check if waypoint name is in any of the digit formats for Desired Heading
                // "ddd", "dddd", "ddd.d"
                if (/^(\d{4}|\d{3}(\.\d)?|)$/.test(waypoint.name)) {
                    waypointWithOffset.heading = waypoint.name;
                }
            } else {
                // Offset waypoint
                // Add the offset waypoint to the previous waypoint
                waypointWithOffset.offset = waypoint;
                // Calculate the heading by the angle of the x/z coordinates, in degrees converted to 3 digit text
                if (waypointWithOffset.heading === null) {
                    let waypointDiff = this.#getWPDeltaMeters(waypointWithOffset.waypoint, waypointWithOffset.offset);
                    let angle = (Math.atan2(waypointDiff.longMeters, waypointDiff.latMeters) * (180 / Math.PI));
                    angle = angle < 0 ? angle + 360 : angle;
                    waypointWithOffset.heading = angle.toFixed(0).padStart(3, "0");
                }
                // Add the waypoint to the collection and reset the object
                waypointCollection.push(waypointWithOffset);
                waypointWithOffset = { waypoint: null, offset: null, heading: null };
            }
        }
        // Add the last waypoint if it exists
        if (waypointWithOffset.waypoint !== null) {
            waypointCollection.push(waypointWithOffset);
        }

        // Now we have a list of waypoints with their offsets, we can create the commands
        for (const waypointWithOffset of waypointCollection) {
            this.#createWaypoint(waypointWithOffset.waypoint);
            if (waypointWithOffset.heading !== null) {
                this.#addDesiredHeading(waypointWithOffset.heading);
            }
            if (waypointWithOffset.offset !== null) {
                this.#createBAD(waypointWithOffset.offset, waypointWithOffset.waypoint);
            }
        }
        return this.#codesPayload;
    }
}

export default m2000;
