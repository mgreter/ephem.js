/* autogenerated by webmerge (join context) */
;
var vsop87b = {};
//***********************************************************
// (c) 2016 by Marcel Greter
// AstroJS VSOP87 utility lib
// https://github.com/mgreter/ephem.js
//***********************************************************
(function(exports) {

	// generic vsop87 solver (pass coefficients and time)
	// this is basically a one to one translation from the official
	// fortran code in vsop87.f at around line 185. Only change is
	// that I took out the multiplication for the summands and apply
	// it after the sum has been calculated. IMO this should be a bit
	// faster than the original implementation, but not sure if the
	// precision will suffer from that change.
	if (typeof exports.vsop87 !== "function") {
		// only define once in global scope
		// otherwise we overwrite loaded data
		exports.vsop87 = function vsop87(coeffs, time)
		{
			// want 1000 JY (KJY)
			var t = time / 1000, result = {},
			    u, cu, tt = [0, 1, t, t*t];
			// reuse old multiplications
			// fortran t(x) array starts at -1!
			// therefore t(it) = tt[it+1] (js)
			tt[4] = tt[3] * t, tt[5] = tt[4] * t, tt[6] = tt[5] * t;
			// do a cheap test if coefficients are from the main vsop87
			// theories. All other [a-e] only need 3 to calculate the
			// full 6 elements (velocity is calculated from position).
			var main = 'a' in coeffs;
			// calculate poisson series
			for (var v in coeffs) {
				// init result holders
				result[v] = 0;
				if (!main) result['v'+v] = 0;
				// loop all coefficients for all powers (t^0, t^1, t^2, etc.)
				for (var it = 0, sum = 0, dsum = 0; it < coeffs[v].length; it += 1) {
					var pow_sum = 0, dpow_sum = 0, coeff = coeffs[v][it];
					for (var i = 0, cl = coeff.length; i < cl; i += 3) {
						// assign coefficients as in fortran code
						// `read (lu,1002,err=500) a,b,c` (line 187)
						var a = coeff[i+0], b = coeff[i+1], c = coeff[i+2];
						// `u=b+c*t(1)` and `cu=dcos(u)`
						u = b + c * t, cu = Math.cos(u);
						// `r(ic)=r(ic)+a*cu*t(it)`
						pow_sum += a * cu * tt[it+1];
						// condition for `if (iv.eq.0) goto 200`
						// calculation for `t(it)*a*c*su` (line 194)
						// note to myself: tt[it]*it != tt[it+1]
						if (!main) dpow_sum += tt[it]*it*a*cu - tt[it+1]*a*c*Math.sin(u);
					}
					// this is the step for r(ic)=r(ic)+(...) (line 191)
					result[v] += pow_sum; /*t(it)*/;
					if (!main) result['v'+v] += dpow_sum / 365250;
				}
			}
			// normalize angles
			if ('L' in result) {
				result.L = result.L % (Math.PI * 2);
				if (result.L < 0) result.L += (Math.PI * 2);
			}
			if ('l' in result) {
				result.l = result.l % (Math.PI * 2);
				if (result.l < 0) result.l += (Math.PI * 2);
			}
			if ('b' in result) {
				result.n = result.n % (Math.PI * 2);
				if (result.n < 0) result.n += (Math.PI * 2);
			}
			// return result
			return result;
		}

	}

	// generic vsop2010/2013 solver (pass coefficients and time)
	// time is julian years from j2000 (delta JD2451545.0 in JY)
	if (typeof exports.vsop87.xyz !== "function") {
		// only define once in global scope
		// otherwise we overwrite loaded data
		exports.vsop87.xyz = function vsop87_xyz(coeffs, j2ky)
		{
			// call main theory
			var orb = exports.vsop87(coeffs, j2ky);
			// create orbit object
			var orbit = new Orbit(orb);
			// query state vector
			var state = orbit.state();
			// attach new properties
			orb.x = state.r.x; orb.vx = state.v.x;
			orb.y = state.r.y; orb.vy = state.v.y;
			orb.z = state.r.z; orb.vz = state.v.z;
			// return object
			return orb;
		}
	}
	// EO fn vsop2k.xyz

	/*
	// position = heliocentric
	function vsop2fk5(position, JD)
	{
		var LL, cos_LL, sin_LL, T, delta_L, delta_B, B;

		// get julian centuries from 2000
		T = (JD - 2451545.0) / 36525.0;

		LL = position.L + (- 1.397 * DEG2RAD - 0.00031 * DEG2RAD * T) * T;
		// LL = ln_deg_to_rad(LL);
		cos_LL = Math.cos(LL);
		sin_LL = Math.sin(LL);
		// B = ln_deg_to_rad(position.B);

		delta_L = (-0.09033 / 3600.0) + (0.03916 / 3600.0) *
				(cos_LL + sin_LL) * Math.tan(B);
		delta_B = (0.03916 / 3600.0) * (cos_LL - sin_LL);

		return {
			l: L + delta_L,
			b: B + delta_B
		};
	}
	*/

})(this);;
(function(vsop87b) {;
// generated by vsop87.pl
function vsop87b_mer(tj) { return vsop87(vsop87b_mer.coeffs, tj); }
function vsop87b_mer_xyz(tj) { return vsop87.xyz(vsop87b_mer.coeffs, tj); }
vsop87b_mer.xyz = vsop87b_mer_xyz; // assign
vsop87b.mer = vsop87b_mer; // export
vsop87b_mer.coeffs = {
	l: [[4.40250710144,0,0,0.40989414977,1.48302034195,26087.9031415742,0.050462942,4.47785489551,52175.8062831484],[26087.9031368553,0,0,0.01131199811,6.21874197797,26087.9031415742]],
	b: [[0.11737528961,1.98357498767,26087.9031415742,0.02388076996,5.03738959686,52175.8062831484,0.01222839532,3.14159265359,0]],
	r: [[0.39528271651,0,0,0.07834131818,6.19233722598,26087.9031415742]]
}; // assign
;
// generated by vsop87.pl
function vsop87b_ven(tj) { return vsop87(vsop87b_ven.coeffs, tj); }
function vsop87b_ven_xyz(tj) { return vsop87.xyz(vsop87b_ven.coeffs, tj); }
vsop87b_ven.xyz = vsop87b_ven_xyz; // assign
vsop87b.ven = vsop87b_ven; // export
vsop87b_ven.coeffs = {
	l: [[3.17614666774,0,0,0.01353968419,5.59313319619,10213.285546211],[10213.2855462164,0,0]],
	b: [[0.05923638472,0.26702775812,10213.285546211]],
	r: [[0.72334820891,0,0]]
}; // assign
;
// generated by vsop87.pl
function vsop87b_ear(tj) { return vsop87(vsop87b_ear.coeffs, tj); }
function vsop87b_ear_xyz(tj) { return vsop87.xyz(vsop87b_ear.coeffs, tj); }
vsop87b_ear.xyz = vsop87b_ear_xyz; // assign
vsop87b.ear = vsop87b_ear; // export
vsop87b_ear.coeffs = {
	l: [[1.75347045673,0,0,0.03341656453,4.66925680415,6283.0758499914],[6283.0758499914,0,0]],
	b: [[2.7962e-006,3.19870156017,84334.6615813083]],
	r: [[1.00013988784,0,0,0.01670699632,3.09846350258,6283.0758499914]]
}; // assign
;
// generated by vsop87.pl
function vsop87b_mar(tj) { return vsop87(vsop87b_mar.coeffs, tj); }
function vsop87b_mar_xyz(tj) { return vsop87.xyz(vsop87b_mar.coeffs, tj); }
vsop87b_mar.xyz = vsop87b_mar_xyz; // assign
vsop87b.mar = vsop87b_mar; // export
vsop87b_mar.coeffs = {
	l: [[6.20347711581,0,0,0.18656368093,5.0503710027,3340.6124266998,0.01108216816,5.40099836344,6681.2248533996],[3340.61242700512,0,0,0.01457554523,3.60433733236,3340.6124266998]],
	b: [[0.03197134986,3.76832042431,3340.6124266998]],
	r: [[1.53033488271,0,0,0.1418495316,3.47971283528,3340.6124266998],[0.01107433345,2.03250524857,3340.6124266998]]
}; // assign
;
// generated by vsop87.pl
function vsop87b_jup(tj) { return vsop87(vsop87b_jup.coeffs, tj); }
function vsop87b_jup_xyz(tj) { return vsop87.xyz(vsop87b_jup.coeffs, tj); }
vsop87b_jup.xyz = vsop87b_jup_xyz; // assign
vsop87b.jup = vsop87b_jup; // export
vsop87b_jup.coeffs = {
	l: [[0.59954691494,0,0,0.09695898719,5.06191793158,529.6909650946],[529.69096508814,0,0]],
	b: [[0.02268615702,3.55852606721,529.6909650946]],
	r: [[5.20887429326,0,0,0.25209327119,3.49108639871,529.6909650946],[0.0127180152,2.64937512894,529.6909650946]]
}; // assign
;
// generated by vsop87.pl
function vsop87b_sat(tj) { return vsop87(vsop87b_sat.coeffs, tj); }
function vsop87b_sat_xyz(tj) { return vsop87.xyz(vsop87b_sat.coeffs, tj); }
vsop87b_sat.xyz = vsop87b_sat_xyz; // assign
vsop87b.sat = vsop87b_sat; // export
vsop87b_sat.coeffs = {
	l: [[0.87401354025,0,0,0.11107659762,3.96205090159,213.299095438,0.01414150957,4.58581516874,7.1135470008],[213.2990952169,0,0,0.01297370862,1.82834923978,213.299095438]],
	b: [[0.04330678039,3.60284428399,213.299095438]],
	r: [[9.55758135486,0,0,0.52921382865,2.39226219573,213.299095438,0.01873679867,5.2354960466,206.1855484372,0.01464663929,1.64763042902,426.598190876],[0.0618298134,0.2584351148,213.299095438]]
}; // assign
;
// generated by vsop87.pl
function vsop87b_ura(tj) { return vsop87(vsop87b_ura.coeffs, tj); }
function vsop87b_ura_xyz(tj) { return vsop87.xyz(vsop87b_ura.coeffs, tj); }
vsop87b_ura.xyz = vsop87b_ura_xyz; // assign
vsop87b.ura = vsop87b_ura; // export
vsop87b_ura.coeffs = {
	l: [[5.48129294297,0,0,0.09260408234,0.89106421507,74.7815985673,0.01504247898,3.6271926092,1.4844727083],[74.7815986091,0,0]],
	b: [[0.01346277648,2.61877810547,74.7815985673]],
	r: [[19.21264847206,0,0,0.88784984413,5.60377527014,74.7815985673,0.03440836062,0.32836099706,73.297125859,0.0205565386,1.7829515933,149.5631971346],[0.01479896629,3.67205697578,74.7815985673]]
}; // assign
;
// generated by vsop87.pl
function vsop87b_nep(tj) { return vsop87(vsop87b_nep.coeffs, tj); }
function vsop87b_nep_xyz(tj) { return vsop87.xyz(vsop87b_nep.coeffs, tj); }
vsop87b_nep.xyz = vsop87b_nep_xyz; // assign
vsop87b.nep = vsop87b_nep; // export
vsop87b_nep.coeffs = {
	l: [[5.31188633046,0,0,0.0179847553,2.9010127389,38.1330356378,0.01019727652,0.48580922867,1.4844727083],[38.13303563957,0,0]],
	b: [[0.03088622933,1.44104372644,38.1330356378]],
	r: [[30.07013205828,0,0,0.27062259632,1.32999459377,38.1330356378,0.01691764014,3.25186135653,36.6485629295]]
}; // assign
;
})(vsop87b)
/* crc: 079C60474FB07194638DD3ACFD13A23D */
