/* autogenerated by webmerge (join context) */
;
(function(window) {;
//***********************************************************
// (c) 2016 by Marcel Greter
// AstroJS utility lib for moons
// https://github.com/mgreter/ephem.js
// pretty much only inspired by Stellarium
//***********************************************************
(function (exports)
{

	/*************************************************************************/
	/*************************************************************************/

	// re-used below
	// allocate once
	var elem = [];

	// import math functions
	var cbrt = Math.cbrt;

	/*************************************************************************/
	/*************************************************************************/

	// calculate VSOP orbital elements in local frame
	function getOrbital(t, body, orbital)
	{
		// js is funky :)
		var fn = this;
		// re-use or create
		orbital = orbital || {};
		// call function with adjusted epoch
		if (!fn || typeof fn != "function") debugger;
		fn(t * 365.25 + fn.epoch, body, elem);
		// get semi-major-axis from via `n` parameter
		// here the first parameter gives the mean motion
		// directly related to period and semi-major-axis
		if (fn.type == 'n') elem[0] =
			cbrt(fn.rmu[body] / (elem[0] * elem[0]));
		// move over to result object
		orbital.a = elem[0]; orbital.L = elem[1];
		orbital.k = elem[2]; orbital.h = elem[3];
		orbital.q = elem[4]; orbital.p = elem[5];
		// set the epoch
		orbital.t = t;
		// return object
		return orbital;
	}
	// EO getOrbital

	/*************************************************************************/
	/*************************************************************************/

	// re-use rotation matrix
	var mat3 = new THREE.Matrix3();

	// get VSOP reference frame elements
	// corrections applied for VSOP87 frame
	function getOrbitalVSOP87(t, body, orbital)
	{
		// js is funky :)
		var fn = this;
		// get uncorrected VSOP elements from function
		orbital = getOrbital.call(fn, t, body, orbital);
		// a bit expensive to get as we need to
		// convert into cartesian to apply rotation
		// we then reconstruct the kepler elements
		// ToDo: can the be implemented directly?
		// Note: doesn't seem to be too obvious!?
		if (matrix = fn.VSOP87mat3) {
			// translate via cartesian coords
			// there might be an easier way?
			// do we really need to convert?
			var orb = new Orbital(orbital);
			// get state vectors
			var state = orb.state(t);
			// check for dynamic rotations
			if (typeof matrix == "function") {
				// get dynamic matrix
				matrix(t, mat3);
				matrix = mat3;
			}
			// rotate cartesian vectors
			state.r.applyMatrix3(matrix);
			state.v.applyMatrix3(matrix);
			// create via rotated state
			orb = new Orbital(state);
			// store results on original object
			orbital.a = orb.a(); orbital.L = orb.L();
			orbital.k = orb.k(); orbital.h = orb.h();
			orbital.q = orb.q(); orbital.p = orb.p();
			orbital.r = orb.r(); orbital.v = orb.v();
		}
		// return object
		return orbital;
	}
	// EO getOrbitalVSOP87

	/*************************************************************************/
	/*************************************************************************/

	// calculate VSOP and state vectors
	function getCartesian(t, body, state)
	{
		// re-use or create
		state = state || {};
		// call main theory
		getOrbitalVSOP87.call(this, t, body, state);
		// attach state vectors (already calculated)
		state.x = state.r.x; state.vx = state.v.x;
		state.y = state.r.y; state.vy = state.v.y;
		state.z = state.r.z; state.vz = state.v.z;
		// return object
		return state;
	}
	// EO getCartesian

	/*************************************************************************/
	/*************************************************************************/

	// helper function to setup satellite
	function setupSatellite(fn, body, name)
	{
		fn[name] = function (t, orbital) { return getOrbitalVSOP87.call(fn, t, body, orbital); }
		fn[name].orb = function (t, coords) { return getOrbital.call(fn, t, body, orbital); }
		fn[name].xyz = function (t, coords) { return getCartesian.call(fn, t, body, coords); }
	}
	// EO setupSatellite

	// helper function to setup satellites
	function setup(type, fn, epoch, matrix3, satellites, rmu)
	{
		fn.type = type, fn.epoch = epoch, fn.VSOP87mat3 = matrix3, fn.rmu = rmu;
		fn.xyz = function xyz(t, body, state) { return getCartesian.call(fn, t, body, state); }
		fn.orb = function orb(t, body, orbital) { return getOrbital.call(fn, t, body, orbital); }
		fn.vsop = function orb(t, body, orbital) { return getOrbital.call(fn, t, body, orbital); }
		for (var i = 0; i < satellites.length; i++) setupSatellite(fn, i, satellites[i]);
		return fn; // return for assignment
	}
	// EO setupSatellites

	/*************************************************************************/
	/*************************************************************************/

	// giving credit where credit is due
	// export them under Stellarium namespace
	// functions are pretty much taken one to one
	exports.Stellarium = setup;

	/*************************************************************************/
	/*************************************************************************/

})(this);;
//***********************************************************
// (c) 2017 by Marcel Greter
// AstroJS Uranian Orbits utility lib
// https://github.com/mgreter/ephem.js
//***********************************************************
// Test how much speed-up unrolling all
// loops will bring, similar to how we do
// with VSOP already (write out all terms)
// ToDo: some data is superfluous for us
//***********************************************************

// This is an implementation of the GUST86 theory.
// Implementation was taken directly from GPL2 licensed Stellarium
// https://github.com/Stellarium/stellarium/blob/master/src/core/planetsephems/gust86.c
// Original sources can be found at ftp://ftp.imcce.fr/pub/ephem/satel/gust86

/*
  Copyright (c) 2017 Marcel Greter
  Copyright (c) 2005 Johannes Gajdosik

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the "Software"),
  to deal in the Software without restriction, including without limitation
  the rights to use, copy, modify, merge, publish, distribute, sublicense,
  and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARIsinG FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

(function (exports)
{

	/*************************************************************************/
	/*************************************************************************/

	// verified - re-arranged for ThreeJS
	// uses column-major order internally
	var GUST86toVsop87 = {
		elements: [
			9.753206632086812015e-01, -2.006444610981783542e-01, 9.214881523275189928e-02,
			6.194425668001473004e-02, -1.519328516640849367e-01, -9.864478281437795399e-01,
			2.119257251551559653e-01, 9.678110398294910731e-01, -1.357544776485127136e-01
		]
	};

	/*************************************************************************/
	/*************************************************************************/

	// make functions local
	// better code size
	var PI = Math.PI;
	var sin = Math.sin;
	var cos = Math.cos;
	var fmod = Math.fmod;

	// re-used below
	// allocate once
	var an = [], ae = [], ai = [];

	var fqn = [
		4.44519055,
		2.492952519,
		1.516148111,
		0.721718509,
		0.46669212
	];

	var fqe = [
		20.082 * PI / (180 * 365.25),
		6.217 * PI / (180 * 365.25),
		2.865 * PI / (180 * 365.25),
		2.078 * PI / (180 * 365.25),
		0.386 * PI / (180 * 365.25)
	];

	var fqi = [
		-20.309 * PI / (180 * 365.25),
		-6.288 * PI / (180 * 365.25),
		-2.836 * PI / (180 * 365.25),
		-1.843 * PI / (180 * 365.25),
		-0.259 * PI / (180 * 365.25)
	];

	var phn = [
		-0.238051,
		3.098046,
		2.285402,
		0.856359,
		-0.915592
	];

	var phe = [
		0.611392,
		2.408974,
		2.067774,
		0.735131,
		0.426767
	];

	var phi = [
		5.702313,
		0.395757,
		0.589326,
		1.746237,
		4.206896
	];

	var gust86_rmu = [
		1.291892353675174e-08,
		1.291910570526396e-08,
		1.291910102284198e-08,
		1.291942656265575e-08,
		1.291935967091320e-08
	];

	/*************************************************************************/
	/*************************************************************************/

	// return raw VSOP orbitals
	// will return as an array
	function uranian(t, body, elem)
	{

		// assert that body input number is valid
		if (isNaN(body) || body < 0 || body > 4) {
			throw Error("Invalid Jupiter Body: " + body);
		}

		// force integer
		body = body | 0;

		for (var i = 0; i < 5; ++i) {
			an[i] = fmod(fqn[i] * t + phn[i], 2 * PI);
			ae[i] = fmod(fqe[i] * t + phe[i], 2 * PI);
			ai[i] = fmod(fqi[i] * t + phi[i], 2 * PI);
		}

		if (body == 0) {

			elem[0 * 6 + 0] = 4.44352267
				- cos(an[0] - an[1] * 3. + an[2] * 2.) * 3.492e-5
				+ cos(an[0] * 2. - an[1] * 6. + an[2] * 4.) * 8.47e-6
				+ cos(an[0] * 3. - an[1] * 9. + an[2] * 6.) * 1.31e-6
				- cos(an[0] - an[1]) * 5.228e-5
				- cos(an[0] * 2. - an[1] * 2.) * 1.3665e-4;
			elem[0 * 6 + 1] =
				sin(an[0] - an[1] * 3. + an[2] * 2.) * .02547217
				- sin(an[0] * 2. - an[1] * 6. + an[2] * 4.) * .00308831
				- sin(an[0] * 3. - an[1] * 9. + an[2] * 6.) * 3.181e-4
				- sin(an[0] * 4. - an[1] * 12 + an[2] * 8.) * 3.749e-5
				- sin(an[0] - an[1]) * 5.785e-5
				- sin(an[0] * 2. - an[1] * 2.) * 6.232e-5
				- sin(an[0] * 3. - an[1] * 3.) * 2.795e-5
				+ t * 4.44519055 - .23805158;
			elem[0 * 6 + 2] = cos(ae[0]) * .00131238
				+ cos(ae[1]) * 7.181e-5
				+ cos(ae[2]) * 6.977e-5
				+ cos(ae[3]) * 6.75e-6
				+ cos(ae[4]) * 6.27e-6
				+ cos(an[0]) * 1.941e-4
				- cos(-an[0] + an[1] * 2.) * 1.2331e-4
				+ cos(an[0] * -2. + an[1] * 3.) * 3.952e-5;
			elem[0 * 6 + 3] = sin(ae[0]) * .00131238
				+ sin(ae[1]) * 7.181e-5
				+ sin(ae[2]) * 6.977e-5
				+ sin(ae[3]) * 6.75e-6
				+ sin(ae[4]) * 6.27e-6
				+ sin(an[0]) * 1.941e-4
				- sin(-an[0] + an[1] * 2.) * 1.2331e-4
				+ sin(an[0] * -2. + an[1] * 3.) * 3.952e-5;
			elem[0 * 6 + 4] = cos(ai[0]) * .03787171
				+ cos(ai[1]) * 2.701e-5
				+ cos(ai[2]) * 3.076e-5
				+ cos(ai[3]) * 1.218e-5
				+ cos(ai[4]) * 5.37e-6;
			elem[0 * 6 + 5] = sin(ai[0]) * .03787171
				+ sin(ai[1]) * 2.701e-5
				+ sin(ai[2]) * 3.076e-5
				+ sin(ai[3]) * 1.218e-5
				+ sin(ai[4]) * 5.37e-6;

		}
		else if (body == 1) {

			elem[0] = 2.49254257
				+ cos(an[0] - an[1] * 3. + an[2] * 2.) * 2.55e-6
				- cos(an[1] - an[2]) * 4.216e-5
				- cos(an[1] * 2. - an[2] * 2.) * 1.0256e-4;
			elem[1] =
				- sin(an[0] - an[1] * 3. + an[2] * 2.) * .0018605
				+ sin(an[0] * 2. - an[1] * 6. + an[2] * 4.) * 2.1999e-4
				+ sin(an[0] * 3. - an[1] * 9. + an[2] * 6.) * 2.31e-5
				+ sin(an[0] * 4. - an[1] * 12 + an[2] * 8.) * 4.3e-6
				- sin(an[1] - an[2]) * 9.011e-5
				- sin(an[1] * 2. - an[2] * 2.) * 9.107e-5
				- sin(an[1] * 3. - an[2] * 3.) * 4.275e-5
				- sin(an[1] * 2. - an[3] * 2.) * 1.649e-5
				+ t * 2.49295252 + 3.09804641;
			elem[2] = cos(ae[0]) * -3.35e-6
				+ cos(ae[1]) * .00118763
				+ cos(ae[2]) * 8.6159e-4
				+ cos(ae[3]) * 7.15e-5
				+ cos(ae[4]) * 5.559e-5
				- cos(-an[1] + an[2] * 2.) * 8.46e-5
				+ cos(an[1] * -2. + an[2] * 3.) * 9.181e-5
				+ cos(-an[1] + an[3] * 2.) * 2.003e-5
				+ cos(an[1]) * 8.977e-5;
			elem[3] = sin(ae[0]) * -3.35e-6
				+ sin(ae[1]) * .00118763
				+ sin(ae[2]) * 8.6159e-4
				+ sin(ae[3]) * 7.15e-5
				+ sin(ae[4]) * 5.559e-5
				- sin(-an[1] + an[2] * 2.) * 8.46e-5
				+ sin(an[1] * -2. + an[2] * 3.) * 9.181e-5
				+ sin(-an[1] + an[3] * 2.) * 2.003e-5
				+ sin(an[1]) * 8.977e-5;
			elem[4] = cos(ai[0]) * -1.2175e-4
				+ cos(ai[1]) * 3.5825e-4
				+ cos(ai[2]) * 2.9008e-4
				+ cos(ai[3]) * 9.778e-5
				+ cos(ai[4]) * 3.397e-5;
			elem[5] = sin(ai[0]) * -1.2175e-4
				+ sin(ai[1]) * 3.5825e-4
				+ sin(ai[2]) * 2.9008e-4
				+ sin(ai[3]) * 9.778e-5
				+ sin(ai[4]) * 3.397e-5;

		}
		else if (body == 2) {

			elem[0] = 1.5159549
				+ cos(an[2] - an[3] * 2. + ae[2]) * 9.74e-6
				- cos(an[1] - an[2]) * 1.06e-4
				+ cos(an[1] * 2. - an[2] * 2.) * 5.416e-5
				- cos(an[2] - an[3]) * 2.359e-5
				- cos(an[2] * 2. - an[3] * 2.) * 7.07e-5
				- cos(an[2] * 3. - an[3] * 3.) * 3.628e-5;
			elem[1] =
				sin(an[0] - an[1] * 3. + an[2] * 2.) * 6.6057e-4
				- sin(an[0] * 2. - an[1] * 6. + an[2] * 4.) * 7.651e-5
				- sin(an[0] * 3. - an[1] * 9. + an[2] * 6.) * 8.96e-6
				- sin(an[0] * 4. - an[1] * 12. + an[2] * 8.) * 2.53e-6
				- sin(an[2] - an[3] * 4. + an[4] * 3.) * 5.291e-5
				- sin(an[2] - an[3] * 2. + ae[4]) * 7.34e-6
				- sin(an[2] - an[3] * 2. + ae[3]) * 1.83e-6
				+ sin(an[2] - an[3] * 2. + ae[2]) * 1.4791e-4
				+ sin(an[2] - an[3] * 2. + ae[1]) * -7.77e-6
				+ sin(an[1] - an[2]) * 9.776e-5
				+ sin(an[1] * 2. - an[2] * 2.) * 7.313e-5
				+ sin(an[1] * 3. - an[2] * 3.) * 3.471e-5
				+ sin(an[1] * 4. - an[2] * 4.) * 1.889e-5
				- sin(an[2] - an[3]) * 6.789e-5
				- sin(an[2] * 2. - an[3] * 2.) * 8.286e-5
				+ sin(an[2] * 3. - an[3] * 3.) * -3.381e-5
				- sin(an[2] * 4. - an[3] * 4.) * 1.579e-5
				- sin(an[2] - an[4]) * 1.021e-5
				- sin(an[2] * 2. - an[4] * 2.) * 1.708e-5
				+ t * 1.51614811 + 2.28540169;
			elem[2] = cos(ae[0]) * -2.1e-7
				- cos(ae[1]) * 2.2795e-4
				+ cos(ae[2]) * .00390469
				+ cos(ae[3]) * 3.0917e-4
				+ cos(ae[4]) * 2.2192e-4
				+ cos(an[1]) * 2.934e-5
				+ cos(an[2]) * 2.62e-5
				+ cos(-an[1] + an[2] * 2.) * 5.119e-5
				- cos(an[1] * -2. + an[2] * 3.) * 1.0386e-4
				- cos(an[1] * -3. + an[2] * 4.) * 2.716e-5
				+ cos(an[3]) * -1.622e-5
				+ cos(-an[2] + an[3] * 2.) * 5.4923e-4
				+ cos(an[2] * -2. + an[3] * 3.) * 3.47e-5
				+ cos(an[2] * -3. + an[3] * 4.) * 1.281e-5
				+ cos(-an[2] + an[4] * 2.) * 2.181e-5
				+ cos(an[2]) * 4.625e-5;
			elem[3] = sin(ae[0]) * -2.1e-7
				- sin(ae[1]) * 2.2795e-4
				+ sin(ae[2]) * .00390469
				+ sin(ae[3]) * 3.0917e-4
				+ sin(ae[4]) * 2.2192e-4
				+ sin(an[1]) * 2.934e-5
				+ sin(an[2]) * 2.62e-5
				+ sin(-an[1] + an[2] * 2.) * 5.119e-5
				- sin(an[1] * -2. + an[2] * 3.) * 1.0386e-4
				- sin(an[1] * -3. + an[2] * 4.) * 2.716e-5
				+ sin(an[3]) * -1.622e-5
				+ sin(-an[2] + an[3] * 2.) * 5.4923e-4
				+ sin(an[2] * -2. + an[3] * 3.) * 3.47e-5
				+ sin(an[2] * -3. + an[3] * 4.) * 1.281e-5
				+ sin(-an[2] + an[4] * 2.) * 2.181e-5
				+ sin(an[2]) * 4.625e-5;
			elem[4] = cos(ai[0]) * -1.086e-5
				- cos(ai[1]) * 8.151e-5
				+ cos(ai[2]) * .00111336
				+ cos(ai[3]) * 3.5014e-4
				+ cos(ai[4]) * 1.065e-4;
			elem[5] = sin(ai[0]) * -1.086e-5
				- sin(ai[1]) * 8.151e-5
				+ sin(ai[2]) * .00111336
				+ sin(ai[3]) * 3.5014e-4
				+ sin(ai[4]) * 1.065e-4;

		}
		else if (body == 3) {

			elem[0] = .72166316
				- cos(an[2] - an[3] * 2. + ae[2]) * 2.64e-6
				- cos(an[3] * 2. - an[4] * 3. + ae[4]) * 2.16e-6
				+ cos(an[3] * 2. - an[4] * 3. + ae[3]) * 6.45e-6
				- cos(an[3] * 2. - an[4] * 3. + ae[2]) * 1.11e-6
				+ cos(an[1] - an[3]) * -6.223e-5
				- cos(an[2] - an[3]) * 5.613e-5
				- cos(an[3] - an[4]) * 3.994e-5
				- cos(an[3] * 2. - an[4] * 2.) * 9.185e-5
				- cos(an[3] * 3. - an[4] * 3.) * 5.831e-5
				- cos(an[3] * 4. - an[4] * 4.) * 3.86e-5
				- cos(an[3] * 5. - an[4] * 5.) * 2.618e-5
				- cos(an[3] * 6. - an[4] * 6.) * 1.806e-5;
			elem[1] =
				sin(an[2] - an[3] * 4. + an[4] * 3.) * 2.061e-5
				- sin(an[2] - an[3] * 2. + ae[4]) * 2.07e-6
				- sin(an[2] - an[3] * 2. + ae[3]) * 2.88e-6
				- sin(an[2] - an[3] * 2. + ae[2]) * 4.079e-5
				+ sin(an[2] - an[3] * 2. + ae[1]) * 2.11e-6
				- sin(an[3] * 2. - an[4] * 3. + ae[4]) * 5.183e-5
				+ sin(an[3] * 2. - an[4] * 3. + ae[3]) * 1.5987e-4
				+ sin(an[3] * 2. - an[4] * 3. + ae[2]) * -3.505e-5
				- sin(an[3] * 3. - an[4] * 4. + ae[4]) * 1.56e-6
				+ sin(an[1] - an[3]) * 4.054e-5
				+ sin(an[2] - an[3]) * 4.617e-5
				- sin(an[3] - an[4]) * 3.1776e-4
				- sin(an[3] * 2. - an[4] * 2.) * 3.0559e-4
				- sin(an[3] * 3. - an[4] * 3.) * 1.4836e-4
				- sin(an[3] * 4. - an[4] * 4.) * 8.292e-5
				+ sin(an[3] * 5. - an[4] * 5.) * -4.998e-5
				- sin(an[3] * 6. - an[4] * 6.) * 3.156e-5
				- sin(an[3] * 7. - an[4] * 7.) * 2.056e-5
				- sin(an[3] * 8. - an[4] * 8.) * 1.369e-5
				+ t * .72171851 + .85635879;
			elem[2] = cos(ae[0]) * -2e-8
				- cos(ae[1]) * 1.29e-6
				- cos(ae[2]) * 3.2451e-4
				+ cos(ae[3]) * 9.3281e-4
				+ cos(ae[4]) * .00112089
				+ cos(an[1]) * 3.386e-5
				+ cos(an[3]) * 1.746e-5
				+ cos(-an[1] + an[3] * 2.) * 1.658e-5
				+ cos(an[2]) * 2.889e-5
				- cos(-an[2] + an[3] * 2.) * 3.586e-5
				+ cos(an[3]) * -1.786e-5
				- cos(an[4]) * 3.21e-5
				- cos(-an[3] + an[4] * 2.) * 1.7783e-4
				+ cos(an[3] * -2. + an[4] * 3.) * 7.9343e-4
				+ cos(an[3] * -3. + an[4] * 4.) * 9.948e-5
				+ cos(an[3] * -4. + an[4] * 5.) * 4.483e-5
				+ cos(an[3] * -5. + an[4] * 6.) * 2.513e-5
				+ cos(an[3] * -6. + an[4] * 7.) * 1.543e-5;
			elem[3] = sin(ae[0]) * -2e-8
				- sin(ae[1]) * 1.29e-6
				- sin(ae[2]) * 3.2451e-4
				+ sin(ae[3]) * 9.3281e-4
				+ sin(ae[4]) * .00112089
				+ sin(an[1]) * 3.386e-5
				+ sin(an[3]) * 1.746e-5
				+ sin(-an[1] + an[3] * 2.) * 1.658e-5
				+ sin(an[2]) * 2.889e-5
				- sin(-an[2] + an[3] * 2.) * 3.586e-5
				+ sin(an[3]) * -1.786e-5
				- sin(an[4]) * 3.21e-5
				- sin(-an[3] + an[4] * 2.) * 1.7783e-4
				+ sin(an[3] * -2. + an[4] * 3.) * 7.9343e-4
				+ sin(an[3] * -3. + an[4] * 4.) * 9.948e-5
				+ sin(an[3] * -4. + an[4] * 5.) * 4.483e-5
				+ sin(an[3] * -5. + an[4] * 6.) * 2.513e-5
				+ sin(an[3] * -6. + an[4] * 7.) * 1.543e-5;
			elem[4] = cos(ai[0]) * -1.43e-6
				- cos(ai[1]) * 1.06e-6
				- cos(ai[2]) * 1.4013e-4
				+ cos(ai[3]) * 6.8572e-4
				+ cos(ai[4]) * 3.7832e-4;
			elem[5] = sin(ai[0]) * -1.43e-6
				- sin(ai[1]) * 1.06e-6
				- sin(ai[2]) * 1.4013e-4
				+ sin(ai[3]) * 6.8572e-4
				+ sin(ai[4]) * 3.7832e-4;

		}
		else if (body == 4) {

			elem[0] = .46658054
				+ cos(an[3] * 2. - an[4] * 3. + ae[4]) * 2.08e-6
				- cos(an[3] * 2. - an[4] * 3. + ae[3]) * 6.22e-6
				+ cos(an[3] * 2. - an[4] * 3. + ae[2]) * 1.07e-6
				- cos(an[1] - an[4]) * 4.31e-5
				+ cos(an[2] - an[4]) * -3.894e-5
				- cos(an[3] - an[4]) * 8.011e-5
				+ cos(an[3] * 2. - an[4] * 2.) * 5.906e-5
				+ cos(an[3] * 3. - an[4] * 3.) * 3.749e-5
				+ cos(an[3] * 4. - an[4] * 4.) * 2.482e-5
				+ cos(an[3] * 5. - an[4] * 5.) * 1.684e-5;
			elem[1] =
				- sin(an[2] - an[3] * 4. + an[4] * 3.) * 7.82e-6
				+ sin(an[3] * 2. - an[4] * 3. + ae[4]) * 5.129e-5
				- sin(an[3] * 2. - an[4] * 3. + ae[3]) * 1.5824e-4
				+ sin(an[3] * 2. - an[4] * 3. + ae[2]) * 3.451e-5
				+ sin(an[1] - an[4]) * 4.751e-5
				+ sin(an[2] - an[4]) * 3.896e-5
				+ sin(an[3] - an[4]) * 3.5973e-4
				+ sin(an[3] * 2. - an[4] * 2.) * 2.8278e-4
				+ sin(an[3] * 3. - an[4] * 3.) * 1.386e-4
				+ sin(an[3] * 4. - an[4] * 4.) * 7.803e-5
				+ sin(an[3] * 5. - an[4] * 5.) * 4.729e-5
				+ sin(an[3] * 6. - an[4] * 6.) * 3e-5
				+ sin(an[3] * 7. - an[4] * 7.) * 1.962e-5
				+ sin(an[3] * 8. - an[4] * 8.) * 1.311e-5
				+ t * .46669212 - .9155918;
			elem[2] = cos(ae[1]) * -3.5e-7
				+ cos(ae[2]) * 7.453e-5
				- cos(ae[3]) * 7.5868e-4
				+ cos(ae[4]) * .00139734
				+ cos(an[1]) * 3.9e-5
				+ cos(-an[1] + an[4] * 2.) * 1.766e-5
				+ cos(an[2]) * 3.242e-5
				+ cos(an[3]) * 7.975e-5
				+ cos(an[4]) * 7.566e-5
				+ cos(-an[3] + an[4] * 2.) * 1.3404e-4
				- cos(an[3] * -2. + an[4] * 3.) * 9.8726e-4
				- cos(an[3] * -3. + an[4] * 4.) * 1.2609e-4
				- cos(an[3] * -4. + an[4] * 5.) * 5.742e-5
				- cos(an[3] * -5. + an[4] * 6.) * 3.241e-5
				- cos(an[3] * -6. + an[4] * 7.) * 1.999e-5
				- cos(an[3] * -7. + an[4] * 8.) * 1.294e-5;
			elem[3] = sin(ae[1]) * -3.5e-7
				+ sin(ae[2]) * 7.453e-5
				- sin(ae[3]) * 7.5868e-4
				+ sin(ae[4]) * .00139734
				+ sin(an[1]) * 3.9e-5
				+ sin(-an[1] + an[4] * 2.) * 1.766e-5
				+ sin(an[2]) * 3.242e-5
				+ sin(an[3]) * 7.975e-5
				+ sin(an[4]) * 7.566e-5
				+ sin(-an[3] + an[4] * 2.) * 1.3404e-4
				- sin(an[3] * -2. + an[4] * 3.) * 9.8726e-4
				- sin(an[3] * -3. + an[4] * 4.) * 1.2609e-4
				- sin(an[3] * -4. + an[4] * 5.) * 5.742e-5
				- sin(an[3] * -5. + an[4] * 6.) * 3.241e-5
				- sin(an[3] * -6. + an[4] * 7.) * 1.999e-5
				- sin(an[3] * -7. + an[4] * 8.) * 1.294e-5;
			elem[4] = cos(ai[0]) * -4.4e-7
				- cos(ai[1]) * 3.1e-7
				+ cos(ai[2]) * 3.689e-5
				- cos(ai[3]) * 5.9633e-4
				+ cos(ai[4]) * 4.5169e-4;
			elem[5] = sin(ai[0]) * -4.4e-7
				- sin(ai[1]) * 3.1e-7
				+ sin(ai[2]) * 3.689e-5
				- sin(ai[3]) * 5.9633e-4
				+ sin(ai[4]) * 4.5169e-4;

		}

		else {

			throw Error("Invalid Uranian Body: " + body);

		}

	}
	// EO uranian

	/*************************************************************************/
	/*************************************************************************/

	// export to globals
	exports.uranian =
		exports.Stellarium(
			'n',
			uranian,
			7305.5,
			GUST86toVsop87,
			[
				'miranda',
				'ariel',
				'umbriel',
				'titania',
				'oberon',
			],
			gust86_rmu
		);

	/*************************************************************************/
	/*************************************************************************/

}.call(this, this))
;
}).call(this, this)
/* crc: D52A09350B83FFCB355231792EE84313 */
