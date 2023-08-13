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
        Parameter: 3574,
        BAD: 3576,
        INS: 3596,
        NextWP: 3110,
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
        this.#codesPayload.push(
            {
                device: 9,
                code: code,
                delay: 100,
                activate: 1,
                addDepress: "true",
            } );
    }

    static #addParamSelectorCode(position) {
        this.#codesPayload.push(
            {
                device: 9,
                code: this.#kuKeycodes.Parameter,
                delay: 100,
                activate: position,
                addDepress: "false",
            } );
    }

    static #addKeyboardCode(character) {
        const characterCode = this.#kuKeycodes[character.toLowerCase()];
        if (characterCode !== undefined)
            this.#addButtonCode(characterCode);
    }

    static #createWaypoint(waypoint) {
        // Parameter selector - Long/Lat
        this.#addParamSelectorCode(this.#parameter.L_G);
        // "Next Waypoint Button"
        this.#addButtonCode(this.#kuKeycodes.NextWP);
        // PREP * 2 - This will Prep the current Dest waypoint
        this.#addButtonCode(this.#kuKeycodes.PREP);
        this.#addButtonCode(this.#kuKeycodes.PREP);
        // "1" (for left field "Longtitude")
        this.#addKeyboardCode('1');
        
        //Type hemisphere
        if (waypoint.latHem === "N") {
            // "2" for N
            this.#addKeyboardCode('2');
        } else {
            // "8" for S
            this.#addKeyboardCode('8');
        }
        //type latitude
        for (let i = 0; i < waypoint.lat.length; i++) {
            this.#addKeyboardCode(waypoint.lat.charAt(i));
        }
        // INS
        this.#addButtonCode(this.#kuKeycodes.INS);
        // "3" (for right field Longtitude)
        this.#addKeyboardCode('3');
        //Type E/W hemisphere
        if (waypoint.longHem === "E") {
            // 6 (East)
            this.#addKeyboardCode('6');
        } else {
            // 4 (West)
            this.#addKeyboardCode('4');
        }
        //type longtitude value
        for (let i = 0; i < waypoint.long.length; i++) {
            this.#addKeyboardCode(waypoint.long.charAt(i));
        }
        // INS
        this.#addButtonCode(this.#kuKeycodes.INS);

        // Parameter selector "ALT"
        this.#addParamSelectorCode(this.#parameter.ALT);
        // 1 - Feet
        this.#addKeyboardCode('1');
        // 1 - Positive
        this.#addKeyboardCode('1');

        //type elevation
        for (let i = 0; i < waypoint.elev.length; i++) {
            this.#addKeyboardCode(waypoint.elev.charAt(i));
        }
        // INS
        this.#addButtonCode(this.#kuKeycodes.INS);
    }

    static #addDesiredHeading(degreesTxt) {
        let degreesOut = "";
        // Parse the degrees text and convert to output format 0000 where last digit is a decimal
        if (degreesTxt.length === 4) {
            degreesOut = degreesTxt;
        } else {
            degreesOut = this.#formatNumber(parseFloat(degreesTxt),4,1);
        }
        // Set Parameter RD/TD   (Route désirée / Temps désiré)
        this.#addParamSelectorCode(this.#parameter.RD_TD);
        // 1 - Left field (Heading value)
        this.#addKeyboardCode('1');
        // Type the number
        for (let i = 0; i < degreesOut.length; i++) {
            this.#addKeyboardCode(degreesOut.charAt(i));
        }
        this.#addButtonCode(this.#kuKeycodes.INS);
    }

    static #toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    static #toDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    static #parseLatLong(value) {
        const parts = value.split(".");
        if (parts.length !== 3) {
            throw new Error("Invalid format for latitude or longitude");
        }
        const degrees = parseFloat(parts[0]);
        const minutes = parseFloat(parts[1] + "." + parts[2]);
        return this.#toRadians(degrees + minutes / 60);
    }

    static #formatNumber(num, totalPlaces, decimalPlaces) {
        let formatted = num.toFixed(decimalPlaces).replace(".", "");
        while (formatted.length < totalPlaces) {
            formatted = "0" + formatted;
        }
        return formatted;
    }

	static #haversineDistance(lat1, long1, lat2, long2) {
        const EARTH_RADIUS = 6371;  // Earth's mean radius in kilometers
		let deltaLat = lat2 - lat1;
		let deltaLong = long2 - long1;

		// Because Caucasus map projection seems to be f*** up it must be detected and adjusted
		// N 40 - 45.38 and E28 - E46
        if(lat1 > 0.6981317 && lat1 < 0.79645 && long1 > 0.48869 && long1 < 0.802851) {
			deltaLat = deltaLat * 1.00535;
			deltaLong = deltaLong * 1.01043;
		}

		const a = Math.pow(Math.sin(deltaLat / 2), 2) + 
                  Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLong / 2), 2);
		const c = 2 * Math.atan(Math.sqrt(a));
		
		return EARTH_RADIUS * c * 1000;
	}
	
    static #getWPDeltaMeters(waypoint1, waypoint2) {

        // Convert lat/long to radians
        let lat1 = this.#parseLatLong(waypoint1.lat);
        let long1 = this.#parseLatLong(waypoint1.long);
        let lat2 = this.#parseLatLong(waypoint2.lat);
        let long2 = this.#parseLatLong(waypoint2.long);

		// Calculate N/S component
		let latDistance = this.#haversineDistance(lat1, long1, lat2, long1);

		// Calculate E/W component using Pythagorean theorem
		let longDistance = this.#haversineDistance(lat1, long1, lat1, long2);
	
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
            latOffset: this.#formatNumber(Math.abs(delta.latMeters), 5, 0),
            latDirKey: delta.latMeters >= 0 ? "2" : "8",
            longOffset: this.#formatNumber(Math.abs(delta.longMeters), 5, 0),
            longDirKey: delta.longMeters >= 0 ? "6" : "4",
            altitudeDifference: this.#formatNumber(Math.abs(delta.altitudeDifference), 5, 0),
            altitudeSignKey: delta.altitudeDifference >= 0 ? "1" : "7",
        };
        // Set Parameter to BAD - ΔL/ΔG
        this.#addParamSelectorCode(this.#parameter.dL_dG);
        // 1 - Left field (N/S offset meters)
        this.#addKeyboardCode('1');
        // Direction
        this.#addKeyboardCode(deltaOut.latDirKey);
        // Type the number + INS
        for (let i = 0; i < deltaOut.latOffset.length; i++) {
            this.#addKeyboardCode(deltaOut.latOffset.charAt(i));
        }
        this.#addButtonCode(this.#kuKeycodes.INS);

        // 3 - Right field (E/W offset meters)
        this.#addKeyboardCode('3');
        // Direction
        this.#addKeyboardCode(deltaOut.longDirKey);
        // Type the number + INS
        for (let i = 0; i < deltaOut.longOffset.length; i++) {
            this.#addKeyboardCode(deltaOut.longOffset.charAt(i));
        }
        this.#addButtonCode(this.#kuKeycodes.INS);

        // Set Parameter to BAD - delta ALT
        this.#addParamSelectorCode(this.#parameter.dALT);
        // Select feet and +/- symbol
        this.#addKeyboardCode('1');
        this.#addKeyboardCode(deltaOut.altitudeSignKey);
        // Type the number for altitude + INS
        for (let i = 0; i < deltaOut.altitudeDifference.length; i++) {
            this.#addKeyboardCode(deltaOut.altitudeDifference.charAt(i));
        }
        this.#addButtonCode(this.#kuKeycodes.INS);
    }

    static createButtonCommands(waypoints) {
        this.#codesPayload = [];
        let previousWP = null;
        for (const waypoint of waypoints) {
            // If the waypoint name = "BAD" then create a Waypoint Offset (BAD - "But Additionnel") 
            // attached to the previous waypoint, but if no previous waypoint provided then create as normal waypoint
            if (waypoint.name.toLowerCase() === "bad" && previousWP !== null) {
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
