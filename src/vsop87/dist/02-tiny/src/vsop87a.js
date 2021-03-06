/* autogenerated by webmerge (join context) */
;
var vsop87a = {};
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
(function(vsop87a) {;
// generated by vsop87.pl
function vsop87a_mer(tj) { return vsop87(vsop87a_mer.coeffs, tj); }
function vsop87a_mer_xyz(tj) { return vsop87.xyz(vsop87a_mer.coeffs, tj); }
vsop87a_mer.xyz = vsop87a_mer_xyz; // assign
vsop87a.mer = vsop87a_mer; // export
vsop87a_mer.coeffs = {
	x: [[0.37546291728,4.39651506942,26087.9031415742,0.03825746672,1.16485604339,52175.8062831484,0.02625615963,3.14159265359,0]],
	y: [[0.37953642888,2.8378061782,26087.9031415742,0.11626131831,3.14159265359,0,0.03854668215,5.88780608966,52175.8062831484]],
	z: [[0.04607665326,1.99295081967,26087.9031415742]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_ven(tj) { return vsop87(vsop87a_ven.coeffs, tj); }
function vsop87a_ven_xyz(tj) { return vsop87.xyz(vsop87a_ven.coeffs, tj); }
vsop87a_ven.xyz = vsop87a_ven_xyz; // assign
vsop87a.ven = vsop87a_ven; // export
vsop87a_ven.coeffs = {
	x: [[0.72211281391,3.17575836361,10213.285546211]],
	y: [[0.72324820731,1.60573808356,10213.285546211]],
	z: [[0.04282990302,0.26703856476,10213.285546211]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_ear(tj) { return vsop87(vsop87a_ear.coeffs, tj); }
function vsop87a_ear_xyz(tj) { return vsop87.xyz(vsop87a_ear.coeffs, tj); }
vsop87a_ear.xyz = vsop87a_ear_xyz; // assign
vsop87a.ear = vsop87a_ear; // export
vsop87a_ear.coeffs = {
	x: [[0.99982928844,1.75348568475,6283.0758499914]],
	y: [[0.9998921103,0.18265890456,6283.0758499914,0.02442699036,3.14159265359,0]],
	z: [[2.7962e-006,3.19870156017,84334.6615813083]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_emb(tj) { return vsop87(vsop87a_emb.coeffs, tj); }
function vsop87a_emb_xyz(tj) { return vsop87.xyz(vsop87a_emb.coeffs, tj); }
vsop87a_emb.xyz = vsop87a_emb_xyz; // assign
vsop87a.emb = vsop87a_emb; // export
vsop87a_emb.coeffs = {
	x: [[0.9998292746,1.75348568475,6283.0758499914]],
	y: [[0.99989209645,0.18265890456,6283.0758499914,0.02442698841,3.14159265359,0]],
	z: [[1.01625e-006,5.42248110597,5507.5532386674]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_mar(tj) { return vsop87(vsop87a_mar.coeffs, tj); }
function vsop87a_mar_xyz(tj) { return vsop87.xyz(vsop87a_mar.coeffs, tj); }
vsop87a_mar.xyz = vsop87a_mar_xyz; // assign
vsop87a.mar = vsop87a_mar; // export
vsop87a_mar.coeffs = {
	x: [[1.51769936383,6.20403346548,3340.6124266998,0.19502945246,3.14159265359,0,0.07070919655,0.25870338558,6681.2248533996]],
	y: [[1.51558976277,4.63212206588,3340.6124266998,0.07064550239,4.97051892902,6681.2248533996,0.08655481102,0,0],[0.0142732421,3.14159265359,0]],
	z: [[0.0490120722,3.76712324286,3340.6124266998]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_jup(tj) { return vsop87(vsop87a_jup.coeffs, tj); }
function vsop87a_jup_xyz(tj) { return vsop87.xyz(vsop87a_jup.coeffs, tj); }
vsop87a_jup.xyz = vsop87a_jup_xyz; // assign
vsop87a.jup = vsop87a_jup; // export
vsop87a_jup.coeffs = {
	x: [[5.19663470114,0.59945082355,529.6909650946,0.3666264232,3.14159265359,0,0.12593937922,0.94911583701,1059.3819301892,0.01500672056,0.7317513461,522.5774180938,0.01476224578,3.61736921122,536.8045120954]],
	y: [[5.19520046589,5.31203162731,529.6909650946,0.12592862602,5.66160227728,1059.3819301892,0.09363670616,3.14159265359,0,0.01508275299,5.43934968102,522.5774180938,0.0147580937,2.04679566495,536.8045120954],[0.01694798253,3.14159265359,0]],
	z: [[0.11823100489,3.55844646343,529.6909650946]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_sat(tj) { return vsop87(vsop87a_sat.coeffs, tj); }
function vsop87a_sat_xyz(tj) { return vsop87.xyz(vsop87a_sat.coeffs, tj); }
vsop87a_sat.xyz = vsop87a_sat_xyz; // assign
vsop87a.sat = vsop87a_sat; // export
vsop87a_sat.coeffs = {
	x: [[9.51638335797,0.87441380794,213.299095438,0.26412374238,0.1239089262,426.598190876,0.06760430339,4.16767145778,206.1855484372,0.06624260115,0.7509473778,220.4126424388,0.04244797817,0,0,0.02336340488,2.02227784673,7.1135470008,0.01255372247,2.17338917731,110.2063212194,0.01115684467,3.15686878377,419.4846438752,0.01097683232,5.65753337256,639.897286314],[0.07575103962,0,0,0.03085041716,4.27565749128,426.598190876,0.02714918399,5.85229412397,206.1855484372,0.02643100909,5.33291950584,220.4126424388]],
	y: [[9.52986882699,5.58600556665,213.299095438,0.79387988806,3.14159265359,0,0.26441781302,4.83528061849,426.598190876,0.06916653915,2.55279408706,206.1855484372,0.06633570703,5.46258848288,220.4126424388,0.02345609742,0.44652132519,7.1135470008,0.01183874652,1.34638298371,419.4846438752,0.01245790434,0.60367177975,110.2063212194,0.01098751131,4.08608782813,639.897286314],[0.05373889135,0,0,0.03090575152,2.70346890906,426.598190876,0.02741594312,4.26667636015,206.1855484372,0.02647489677,3.76132298889,220.4126424388]],
	z: [[0.4135695094,3.60234142982,213.299095438,0.01148283576,2.85128367469,426.598190876,0.01214249867,0,0],[0.01906503283,4.94544746116,213.299095438]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_ura(tj) { return vsop87(vsop87a_ura.coeffs, tj); }
function vsop87a_ura_xyz(tj) { return vsop87.xyz(vsop87a_ura.coeffs, tj); }
vsop87a_ura.xyz = vsop87a_ura_xyz; // assign
vsop87a.ura = vsop87a_ura; // export
vsop87a_ura.coeffs = {
	x: [[19.17370730359,5.48133416489,74.7815985673,1.32272523872,0,0,0.44402496796,1.65967519586,149.5631971346,0.14668209481,3.42395862804,73.297125859,0.14130269479,4.39572927934,76.2660712756,0.06201106178,5.14043574125,1.4844727083,0.01542951343,4.12121838072,224.3447957019,0.0144421666,2.65117115201,148.0787244263]],
	y: [[19.16518231584,3.91045677002,74.7815985673,0.44390465203,0.08884111329,149.5631971346,0.16256125476,3.14159265359,0,0.14755940186,1.85423280679,73.297125859,0.14123958128,2.82486076549,76.2660712756,0.06250078231,3.56960243857,1.4844727083,0.01542668264,2.55040539213,224.3447957019,0.01442356575,1.08004542712,148.0787244263],[0.02157896385,0,0]],
	z: [[0.25878127698,2.61861272578,74.7815985673,0.01774318778,3.14159265359,0]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_nep(tj) { return vsop87(vsop87a_nep.coeffs, tj); }
function vsop87a_nep_xyz(tj) { return vsop87.xyz(vsop87a_nep.coeffs, tj); }
vsop87a_nep.xyz = vsop87a_nep_xyz; // assign
vsop87a.nep = vsop87a_nep; // export
vsop87a_nep.coeffs = {
	x: [[30.05890004476,5.31211340029,38.1330356378,0.27080164222,3.14159265359,0,0.13505661755,3.50078975634,76.2660712756,0.15726094556,0.11319072675,36.6485629295,0.14935120126,1.08499403018,39.6175083461,0.02597313814,1.99590301412,1.4844727083,0.01074040708,5.38502938672,74.7815985673]],
	y: [[30.06056351665,3.74086294714,38.1330356378,0.30205857683,3.14159265359,0,0.13506391797,1.92953034883,76.2660712756,0.15706589373,4.82539970129,36.6485629295,0.14936165806,5.79694900665,39.6175083461,0.02584250749,0.42549700754,1.4844727083,0.01073739772,3.81371728533,74.7815985673]],
	z: [[0.92866054405,1.44103930278,38.1330356378,0.01245978462,0,0]]
}; // assign
;
})(vsop87a)
/* crc: E3A052CABBA71B071835F6AF26629955 */
