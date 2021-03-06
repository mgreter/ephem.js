/* autogenerated by webmerge (join context) */
;
var vsop87c = {};
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
(function(vsop87c) {;
// generated by vsop87.pl
function vsop87c_mer(tj) { return vsop87(vsop87c_mer.coeffs, tj); }
function vsop87c_mer_xyz(tj) { return vsop87.xyz(vsop87c_mer.coeffs, tj); }
vsop87c_mer.xyz = vsop87c_mer_xyz; // assign
vsop87c.mer = vsop87c_mer; // export
vsop87c_mer.coeffs = {
	x: [[0.37749277893,4.40259139579,26088.1469590577,0.11918926148,4.49027758439,0.2438174835,0.03840153904,1.17015646101,52176.0501006319]],
	y: [[0.37749277893,2.83179506899,26088.1469590577,0.11918926148,2.9194812576,0.2438174835,0.03840153904,5.8825454414,52176.0501006319]],
	z: [[0.04607665326,1.99295081967,26087.9031415742]]
}; // assign
;
// generated by vsop87.pl
function vsop87c_ven(tj) { return vsop87(vsop87c_ven.coeffs, tj); }
function vsop87c_ven_xyz(tj) { return vsop87.xyz(vsop87c_ven.coeffs, tj); }
vsop87c_ven.xyz = vsop87c_ven_xyz; // assign
vsop87c.ven = vsop87c_ven; // export
vsop87c_ven.coeffs = {
	x: [[0.72268045621,3.17614669179,10213.5293636945]],
	y: [[0.72268045621,1.60535036499,10213.5293636945]],
	z: [[0.04282990302,0.26703856476,10213.285546211]]
}; // assign
;
// generated by vsop87.pl
function vsop87c_ear(tj) { return vsop87(vsop87c_ear.coeffs, tj); }
function vsop87c_ear_xyz(tj) { return vsop87.xyz(vsop87c_ear.coeffs, tj); }
vsop87c_ear.xyz = vsop87c_ear_xyz; // assign
vsop87c.ear = vsop87c_ear; // export
vsop87c_ear.coeffs = {
	x: [[0.99986069925,1.75347045757,6283.3196674749,0.02506324281,4.93819429098,0.2438174835]],
	y: [[0.99986069925,0.18267413078,6283.3196674749,0.02506324281,3.36739796418,0.2438174835]],
	z: [[2.7962e-006,3.19870156017,84334.6615813083]]
}; // assign
;
// generated by vsop87.pl
function vsop87c_mar(tj) { return vsop87(vsop87c_mar.coeffs, tj); }
function vsop87c_mar_xyz(tj) { return vsop87.xyz(vsop87c_mar.coeffs, tj); }
vsop87c_mar.xyz = vsop87c_mar_xyz; // assign
vsop87c.mar = vsop87c_mar; // export
vsop87c_mar.coeffs = {
	x: [[1.51664432758,6.20347631684,3340.8562441833,0.2133734347,2.723903427,0.2438174835,0.07067734657,0.2584167963,6681.46867088311],[0.01668487239,4.16976892466,0.2438174835]],
	y: [[1.51664432758,4.63267999004,3340.8562441833,0.2133734347,1.15310710021,0.2438174835,0.07067734657,4.97080577669,6681.46867088311],[0.01668487239,2.59897259786,0.2438174835]],
	z: [[0.0490120722,3.76712324286,3340.6124266998]]
}; // assign
;
// generated by vsop87.pl
function vsop87c_jup(tj) { return vsop87(vsop87c_jup.coeffs, tj); }
function vsop87c_jup_xyz(tj) { return vsop87.xyz(vsop87c_jup.coeffs, tj); }
vsop87c_jup.xyz = vsop87c_jup_xyz; // assign
vsop87c.jup = vsop87c_jup; // export
vsop87c_jup.coeffs = {
	x: [[5.19591755961,0.599546722,529.9347825781,0.37839498798,3.39164799011,0.2438174835,0.12593400247,0.94916456487,1059.6257476727,0.01504469362,0.72934997067,522.8212355773,0.01476016965,3.61748058581,537.0483295789],[0.0191255649,4.23275123829,0.2438174835]],
	y: [[5.19591755961,5.31193570238,529.9347825781,0.37839498798,1.82085166331,0.2438174835,0.12593400247,5.66155354525,1059.6257476727,0.01504469362,5.44173895105,522.8212355773,0.01476016965,2.04668425902,537.0483295789],[0.0191255649,2.66195491149,0.2438174835]],
	z: [[0.11823100489,3.55844646343,529.6909650946]]
}; // assign
;
// generated by vsop87.pl
function vsop87c_sat(tj) { return vsop87(vsop87c_sat.coeffs, tj); }
function vsop87c_sat_xyz(tj) { return vsop87.xyz(vsop87c_sat.coeffs, tj); }
vsop87c_sat.xyz = vsop87c_sat_xyz; // assign
vsop87c.sat = vsop87c_sat; // export
vsop87c_sat.coeffs = {
	x: [[9.52312533591,0.87401491487,213.5429129215,0.79501390398,4.76580713096,0.2438174835,0.26427074351,0.12339999915,426.8420083595,0.06836881382,4.14537914189,206.42936592071,0.06628914946,0.75057317755,220.6564599223,0.02340967916,2.01979283929,7.3573644843,0.01250581159,2.17392657526,110.45013870291,0.01141539711,3.03345312296,419.72846135871,0.01098217124,5.65720860592,640.1411037975],[0.09285877988,0.61678993503,0.2438174835,0.0308650168,4.27493632359,426.8420083595,0.02728479923,5.8447638902,206.42936592071,0.02644990371,5.33256382404,220.6564599223]],
	y: [[9.52312533591,5.58640389526,213.5429129215,0.79501390398,3.19501080417,0.2438174835,0.26427074351,4.83578897954,426.8420083595,0.06836881382,2.57458281509,206.42936592071,0.06628914946,5.46296215793,220.6564599223,0.02340967916,0.44899651249,7.3573644843,0.01250581159,0.60313024847,110.45013870291,0.01141539711,1.46265679616,419.72846135871,0.01098217124,4.08641227912,640.1411037975],[0.09285877988,5.32917891541,0.2438174835,0.0308650168,2.70413999679,426.8420083595,0.02728479923,4.27396756341,206.42936592071,0.02644990371,3.76176749725,220.6564599223]],
	z: [[0.4135695094,3.60234142982,213.299095438,0.01148283576,2.85128367469,426.598190876,0.01214249867,0,0],[0.0381030832,5.33520316778,213.299095438]]
}; // assign
;
// generated by vsop87.pl
function vsop87c_ura(tj) { return vsop87(vsop87c_ura.coeffs, tj); }
function vsop87c_ura_xyz(tj) { return vsop87.xyz(vsop87c_ura.coeffs, tj); }
vsop87c_ura.xyz = vsop87c_ura_xyz; // assign
vsop87c.ura = vsop87c_ura; // export
vsop87c_ura.coeffs = {
	x: [[19.16944479396,5.48129363987,75.0254160508,1.33267708718,6.16089978558,0.2438174835,0.44396480992,1.65965632053,149.8070146181,0.14712072726,3.42449547672,73.5409433425,0.14127113794,4.39569319388,76.50988875911,0.06225592204,5.14041718059,1.7282901918,0.01542809804,4.12121005059,224.5886131854,0.01443286598,2.65100655909,148.32254190981],[0.0222511375,1.80968682072,0.2438174835],[0.0101661895,0.77056492682,75.0254160508]],
	y: [[19.16944479396,3.91049731307,75.0254160508,1.33267708718,4.59010345878,0.2438174835,0.44396480992,0.08885999374,149.8070146181,0.14712072726,1.85369914992,73.5409433425,0.14127113794,2.82489686708,76.50988875911,0.06225592204,3.56962085379,1.7282901918,0.01542809804,2.55041372379,224.5886131854,0.01443286598,1.08021023229,148.32254190981],[0.0222511375,0.23889049392,0.2438174835],[0.0101661895,5.4829539072,75.0254160508]],
	z: [[0.25878127698,2.61861272578,74.7815985673,0.01774318778,3.14159265359,0],[0.03962262983,4.12418900865,74.7815985673]]
}; // assign
;
// generated by vsop87.pl
function vsop87c_nep(tj) { return vsop87(vsop87c_nep.coeffs, tj); }
function vsop87c_nep_xyz(tj) { return vsop87.xyz(vsop87c_nep.coeffs, tj); }
vsop87c_nep.xyz = vsop87c_nep_xyz; // assign
vsop87c.nep = vsop87c_nep; // export
vsop87c_nep.coeffs = {
	x: [[30.0597310058,5.31188633083,38.3768531213,0.40567587218,3.98149970131,0.2438174835,0.13506026414,3.50055820972,76.50988875911,0.15716341901,0.11310077968,36.892380413,0.14935642614,1.08477702063,39.86132582961,0.02590782232,1.99609768221,1.7282901918,0.01073890204,5.38477153556,75.0254160508],[],[0.01620002167,0.60038473142,38.3768531213]],
	y: [[30.0597310058,3.74109000403,38.3768531213,0.40567587218,2.41070337452,0.2438174835,0.13506026414,1.92976188293,76.50988875911,0.15716341901,4.82548976006,36.892380413,0.14935642614,5.79716600101,39.86132582961,0.02590782232,0.42530135542,1.7282901918,0.01073890204,3.81397520876,75.0254160508],[],[0.01620002167,5.31277371181,38.3768531213]],
	z: [[0.92866054405,1.44103930278,38.1330356378,0.01245978462,0,0],[0.06832633707,3.80782656293,38.1330356378]]
}; // assign
;
})(vsop87c)
/* crc: BD5398C5250BA740227ADCE9F3C509FD */
