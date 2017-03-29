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
	x: [[0.37546291728,4.39651506942,26087.9031415742,0.03825746672,1.16485604339,52175.8062831484,0.02625615963,3.14159265359,0,0.00584261333,4.21599394757,78263.7094247226,0.00105716695,0.98379033182,104351.612566297,0.0002101173,4.03469353923,130439.515707871],[0.00318848034,0,0,0.00105289019,5.91600475006,52175.8062831484,0.00032316001,2.68247273347,78263.7094247226,0.00011992889,5.81575112963,26087.9031415742]],
	y: [[0.37953642888,2.8378061782,26087.9031415742,0.11626131831,3.14159265359,0,0.03854668215,5.88780608966,52175.8062831484,0.00587711268,2.65498896201,78263.7094247226,0.00106235493,5.70550616735,104351.612566297,0.00021100828,2.47291315849,130439.515707871],[0.00107803852,4.34964793883,52175.8062831484,0.00080651544,3.14159265359,0,0.00032715354,1.11763734425,78263.7094247226,0.00011914709,1.2213998634,26087.9031415742]],
	z: [[0.04607665326,1.99295081967,26087.9031415742,0.00708734365,3.14159265359,0,0.00469171617,5.04215742764,52175.8062831484,0.00071626395,1.80894256071,78263.7094247226,0.00012957446,4.8592203201,104351.612566297],[0.00108722177,3.91134750825,26087.9031415742,0.00057826621,3.14159265359,0]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_ven(tj) { return vsop87(vsop87a_ven.coeffs, tj); }
function vsop87a_ven_xyz(tj) { return vsop87.xyz(vsop87a_ven.coeffs, tj); }
vsop87a_ven.xyz = vsop87a_ven_xyz; // assign
vsop87a.ven = vsop87a_ven; // export
vsop87a_ven.coeffs = {
	x: [[0.72211281391,3.17575836361,10213.285546211,0.00486448018,0,0,0.00244500474,4.05566613861,20426.571092422],[0.00033862636,3.14159265359,0,0.00017234992,0.92721124604,20426.571092422]],
	y: [[0.72324820731,1.60573808356,10213.285546211,0.00549506273,3.14159265359,0,0.0024488479,2.48564954004,20426.571092422],[0.0003923143,0,0,0.00017282326,5.638247359,20426.571092422]],
	z: [[0.04282990302,0.26703856476,10213.285546211,0.00035588343,3.14159265359,0,0.00014501879,1.1469691139,20426.571092422],[0.00208096402,1.88967278742,10213.285546211]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_ear(tj) { return vsop87(vsop87a_ear.coeffs, tj); }
function vsop87a_ear_xyz(tj) { return vsop87.xyz(vsop87a_ear.coeffs, tj); }
vsop87a_ear.xyz = vsop87a_ear_xyz; // assign
vsop87a.ear = vsop87a_ear; // export
vsop87a_ear.coeffs = {
	x: [[0.99982928844,1.75348568475,6283.0758499914,0.008352573,1.7103453945,12566.1516999828,0.00561144206,0,0,0.00010466628,1.66722645223,18849.2275499742],[0.00123403056,0,0,0.00051500156,6.00266267204,12566.1516999828]],
	y: [[0.9998921103,0.18265890456,6283.0758499914,0.02442699036,3.14159265359,0,0.00835292314,0.13952878991,12566.1516999828,0.00010466965,0.09641690558,18849.2275499742],[0.00093046324,0,0,0.00051506609,4.43180499286,12566.1516999828]],
	z: [[2.7962e-006,3.19870156017,84334.6615813083],[0.00227822442,3.41372504278,6283.0758499914]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_emb(tj) { return vsop87(vsop87a_emb.coeffs, tj); }
function vsop87a_emb_xyz(tj) { return vsop87.xyz(vsop87a_emb.coeffs, tj); }
vsop87a_emb.xyz = vsop87a_emb_xyz; // assign
vsop87a.emb = vsop87a_emb; // export
vsop87a_emb.coeffs = {
	x: [[0.9998292746,1.75348568475,6283.0758499914,0.008352573,1.7103453945,12566.1516999828,0.00561144161,0,0,0.00010466628,1.66722645223,18849.2275499742],[0.00123403046,0,0,0.00051500156,6.00266267204,12566.1516999828]],
	y: [[0.99989209645,0.18265890456,6283.0758499914,0.02442698841,3.14159265359,0,0.00835292314,0.13952878991,12566.1516999828,0.00010466965,0.09641690558,18849.2275499742],[0.00093046317,0,0,0.00051506609,4.43180499286,12566.1516999828]],
	z: [[1.01625e-006,5.42248110597,5507.5532386674],[0.00227822442,3.41372504278,6283.0758499914]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_mar(tj) { return vsop87(vsop87a_mar.coeffs, tj); }
function vsop87a_mar_xyz(tj) { return vsop87.xyz(vsop87a_mar.coeffs, tj); }
vsop87a_mar.xyz = vsop87a_mar_xyz; // assign
vsop87a.mar = vsop87a_mar; // export
vsop87a_mar.coeffs = {
	x: [[1.51769936383,6.20403346548,3340.6124266998,0.19502945246,3.14159265359,0,0.07070919655,0.25870338558,6681.2248533996,0.00494196914,0.59669127768,10021.8372800994,0.00040938237,0.93473307419,13362.4497067992,0.00021067199,1.80435656154,3337.0893083508,0.00021041626,1.17895619474,3344.1355450488,0.00011370375,4.83265211109,1059.3819301892,0.00013527976,0.63010765169,529.6909650946],[0.00861441374,3.14159265359,0,0.00552437949,5.09565872891,6681.2248533996,0.00077184977,5.43315636209,10021.8372800994,0.00020467294,5.57051812369,3340.6124266998],[0.00056323939,0,0,0.00022122528,3.54372113272,6681.2248533996]],
	y: [[1.51558976277,4.63212206588,3340.6124266998,0.07064550239,4.97051892902,6681.2248533996,0.08655481102,0,0,0.00493872848,5.30877806694,10021.8372800994,0.00040917422,5.64698263703,13362.4497067992,0.00021036784,0.23240270955,3337.0893083508,0.00021012921,5.89022773653,3344.1355450488,0.00011370034,3.26131408801,1059.3819301892,0.00013324177,5.34259389724,529.6909650946],[0.0142732421,3.14159265359,0,0.00551063753,3.52128320402,6681.2248533996,0.00077091913,3.86082685753,10021.8372800994,0.00037310491,1.16016958445,3340.6124266998],[0.00035396765,3.14159265359,0,0.00021950759,1.96291594946,6681.2248533996]],
	z: [[0.0490120722,3.76712324286,3340.6124266998,0.00660669541,0,0,0.00228333904,4.10544022266,6681.2248533996,0.00015958402,4.44367058261,10021.8372800994],[0.00331842958,6.05027773492,3340.6124266998,0.00047930411,3.14159265359,0],[0.0001370536,1.04212852598,3340.6124266998]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_jup(tj) { return vsop87(vsop87a_jup.coeffs, tj); }
function vsop87a_jup_xyz(tj) { return vsop87.xyz(vsop87a_jup.coeffs, tj); }
vsop87a_jup.xyz = vsop87a_jup_xyz; // assign
vsop87a.jup = vsop87a_jup; // export
vsop87a_jup.coeffs = {
	x: [[5.19663470114,0.59945082355,529.6909650946,0.3666264232,3.14159265359,0,0.12593937922,0.94911583701,1059.3819301892,0.01500672056,0.7317513461,522.5774180938,0.01476224578,3.61736921122,536.8045120954,0.00457752736,1.29883700755,1589.0728952838,0.00301689798,5.17372551148,7.1135470008,0.00385975375,2.01229910687,103.0927742186,0.00194025405,5.02580363996,426.598190876,0.00150678793,6.12003027739,110.2063212194,0.00144867641,5.5598057708,632.7837393132,0.00134226996,0.87648567011,213.299095438,0.00103494641,6.1932476912,1052.2683831884,0.00114201562,0.01567084269,1162.4747044078,0.00072095575,3.96117430643,1066.49547719,0.00059486083,4.45769374358,949.1756089698,0.00068284021,3.44051122631,846.0828347512,0.00047092251,1.44612636451,419.4846438752,0.00030623417,2.99132321427,206.1855484372,0.00026613459,4.85169906494,323.5054166574,0.00019727457,1.64891626213,2118.7638603784,0.00016481594,1.95150056568,316.3918696566,0.00016101974,0.8797315598,515.463871093,0.00014209487,2.07769621413,742.9900605326,0.00015192516,6.25820127906,735.8765135318,0.00011423199,3.48146108929,543.9180590962,0.00012155285,3.75229924999,525.7588118315,0.00011996271,0.58568573729,533.6231183577],[0.00882389251,3.14159265359,0,0.00635297172,0.10662156868,1059.3819301892,0.00599720482,2.42996678275,522.5774180938,0.0058915706,1.91556314637,536.8045120954,0.00081697204,3.46668108797,7.1135470008,0.00046201898,0.45714214032,1589.0728952838,0.0003250859,1.74648849928,1052.2683831884,0.00033891193,4.10113482752,529.6909650946,0.00031234303,2.34698051502,1066.49547719,0.00021244363,4.36576178953,110.2063212194,0.00018156701,4.00572238779,426.598190876,0.00013577576,0.30008010246,632.7837393132,0.00012889505,2.57489294062,515.463871093],[0.00123864644,4.13563277513,522.5774180938,0.00121521296,0.21155109275,536.8045120954,0.00085355503,0,0,0.00077685547,5.29776154458,529.6909650946,0.00041410887,5.12291589939,1059.3819301892,0.0001142307,1.72917878238,7.1135470008],[0.00017071323,5.86133022278,522.5774180938,0.00016713548,4.77458794485,536.8045120954]],
	y: [[5.19520046589,5.31203162731,529.6909650946,0.12592862602,5.66160227728,1059.3819301892,0.09363670616,3.14159265359,0,0.01508275299,5.43934968102,522.5774180938,0.0147580937,2.04679566495,536.8045120954,0.00457750806,6.01129093501,1589.0728952838,0.00300686679,3.6094805074,7.1135470008,0.00378285578,3.53006782383,103.0927742186,0.00192333128,3.45690564771,426.598190876,0.00146104656,4.62267224431,110.2063212194,0.00139480058,4.00075307706,632.7837393132,0.00132696764,5.62184581859,213.299095438,0.00101999807,4.57594598884,1052.2683831884,0.0011404311,4.72982262969,1162.4747044078,0.00072091178,2.39048659148,1066.49547719,0.00059051769,2.89529070968,949.1756089698,0.00068374489,1.86537074374,846.0828347512,0.00029807369,4.5210577274,206.1855484372,0.00026933579,3.86233956827,419.4846438752,0.00026619714,3.28203174951,323.5054166574,0.0002087378,3.79369881757,735.8765135318,0.00019727397,0.07818534532,2118.7638603784,0.00018639846,0.38751972138,316.3918696566,0.00016355726,5.56997881604,515.463871093,0.00014606858,0.47759399145,742.9900605326,0.00011419853,1.91089341468,543.9180590962,0.00012153427,2.18151972499,525.7588118315,0.00011988875,5.29687602089,533.6231183577],[0.01694798253,3.14159265359,0,0.00634859798,4.8190319965,1059.3819301892,0.00601160431,0.8581124994,522.5774180938,0.00588928504,0.3449157689,536.8045120954,0.00081187145,1.90914316532,7.1135470008,0.0004688809,1.91294535618,529.6909650946,0.00046194129,5.16955994561,1589.0728952838,0.00032503453,0.17640743623,1052.2683831884,0.00031231694,0.77623645597,1066.49547719,0.00019462096,3.0095711947,110.2063212194,0.00017738615,2.46531787101,426.598190876,0.00013701692,5.02070197804,632.7837393132,0.00013034616,0.98979834442,515.463871093],[0.00124032509,2.56495576833,522.5774180938,0.00121455991,4.9239876638,536.8045120954,0.00076523263,3.75913371793,529.6909650946,0.00076943042,3.14159265359,0,0.000413576,3.55228440457,1059.3819301892,0.00011277667,0.18559902389,7.1135470008],[0.00017085516,4.29096904063,522.5774180938,0.00016701353,3.20365737109,536.8045120954]],
	z: [[0.11823100489,3.55844646343,529.6909650946,0.00859031952,0,0,0.00286562094,3.90812238338,1059.3819301892,0.00042388592,3.60144191032,522.5774180938,0.00033295491,0.30297050585,536.8045120954,0.0001041616,4.25764593061,1589.0728952838],[0.00407072175,1.52699353482,529.6909650946,0.00020307341,2.59878269248,1059.3819301892,0.00014424953,4.85400155025,536.8045120954,0.00015474611,0,0,0.00012730364,5.45536715732,522.5774180938],[0.00028635326,3.01374166973,529.6909650946]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_sat(tj) { return vsop87(vsop87a_sat.coeffs, tj); }
function vsop87a_sat_xyz(tj) { return vsop87.xyz(vsop87a_sat.coeffs, tj); }
vsop87a_sat.xyz = vsop87a_sat_xyz; // assign
vsop87a.sat = vsop87a_sat; // export
vsop87a_sat.coeffs = {
	x: [[9.51638335797,0.87441380794,213.299095438,0.26412374238,0.1239089262,426.598190876,0.06760430339,4.16767145778,206.1855484372,0.06624260115,0.7509473778,220.4126424388,0.04244797817,0,0,0.02336340488,2.02227784673,7.1135470008,0.01255372247,2.17338917731,110.2063212194,0.01115684467,3.15686878377,419.4846438752,0.01097683232,5.65753337256,639.897286314,0.00716328481,2.71149993708,316.3918696566,0.00509313365,4.9586562478,103.0927742186,0.00433994439,0.72012820974,529.6909650946,0.00372894461,0.00137195497,433.7117378768,0.00097843523,1.01485750417,323.5054166574,0.00080600536,5.62103979796,11.0457002639,0.00083782316,0.62038893702,227.5261894396,0.00074150224,2.38206066655,632.7837393132,0.00070219382,0.88789752415,209.3669421749,0.00068855792,4.01788097627,217.2312487011,0.00065620467,2.69728593339,202.2533951741,0.00058297911,2.16155251399,224.3447957019,0.00054022837,4.90928184374,853.196381752,0.00045550446,1.8823503783,14.2270940016,0.00038345667,4.39815501478,199.0720014364,0.00044551703,5.60763553535,63.7358983034,0.00025165185,0.37800582257,216.4804891757,0.00024554499,4.53150598095,210.1177017003,0.00024673219,5.9089157385,522.5774180938,0.0002467705,5.6038938242,415.5524906121,0.00025491374,1.63922423181,117.3198682202,0.00031253049,4.62976601833,735.8765135318,0.00023372467,5.53491987276,647.0108333148,0.00023355468,0.18791490124,149.5631971346,0.00024805815,5.50327676733,74.7815985673,0.00014731703,4.67981909838,277.0349937414,0.00012427525,1.02995545746,1059.3819301892,0.00012393514,4.19747622821,490.3340891794,0.00012026472,5.66372282839,351.8165923087],[0.07575103962,0,0,0.03085041716,4.27565749128,426.598190876,0.02714918399,5.85229412397,206.1855484372,0.02643100909,5.33291950584,220.4126424388,0.0062710452,0.32898307969,7.1135470008,0.00256560953,3.52478934343,639.897286314,0.00312356512,4.83001724941,419.4846438752,0.00189196274,4.48642453552,433.7117378768,0.0020364657,1.10998681782,213.299095438,0.00119531145,1.14735096078,110.2063212194,0.00066764238,3.72346596928,316.3918696566,0.00066901225,5.2025750038,227.5261894396,0.0003100084,6.06067919437,199.0720014364,0.000304181,0.18746903351,14.2270940016,0.0002227521,6.19530878014,103.0927742186,0.00018939377,2.77618306725,853.196381752,0.00018093009,5.09162723865,209.3669421749,0.00017777854,6.10381593351,217.2312487011,0.00016296201,4.86945681437,216.4804891757,0.0001712025,4.59611664188,632.7837393132,0.00015894491,0.03653502304,210.1177017003,0.00016192653,5.6079801445,323.5054166574,0.0001446601,3.6744938009,647.0108333148,0.00011061528,0.03163071461,117.3198682202],[0.00560746334,1.26401632282,206.1855484372,0.00545834518,3.62343709657,220.4126424388,0.00443342186,3.14159265359,0,0.00336109713,2.4254743246,213.299095438,0.00224302269,2.49151203519,426.598190876,0.00087170924,4.89048951691,7.1135470008,0.00050028094,2.70119046081,433.7117378768,0.0004512259,0.36735068943,419.4846438752,0.00032847824,1.59210153669,639.897286314,0.00027153555,3.49804002218,227.5261894396,0.00012676167,1.4546572953,199.0720014364,0.00010330738,4.7694953129,14.2270940016],[0.00077115952,2.97714385362,206.1855484372,0.00075340436,1.89208005248,220.4126424388,0.00018450895,3.14159265359,0,0.00010527244,0.66368256891,426.598190876]],
	y: [[9.52986882699,5.58600556665,213.299095438,0.79387988806,3.14159265359,0,0.26441781302,4.83528061849,426.598190876,0.06916653915,2.55279408706,206.1855484372,0.06633570703,5.46258848288,220.4126424388,0.02345609742,0.44652132519,7.1135470008,0.01183874652,1.34638298371,419.4846438752,0.01245790434,0.60367177975,110.2063212194,0.01098751131,4.08608782813,639.897286314,0.00700849336,1.13611298025,316.3918696566,0.00434466176,5.42474696262,529.6909650946,0.00373327342,4.71308726958,433.7117378768,0.00335162363,0.66422253983,103.0927742186,0.00097837745,5.72844290173,323.5054166574,0.00080571808,4.0529544991,11.0457002639,0.00083899691,5.33204070267,227.5261894396,0.00070158491,5.59777963629,209.3669421749,0.00065937657,1.25969608208,202.2533951741,0.00070957225,0.88888207567,632.7837393132,0.00068985859,2.44460312617,217.2312487011,0.00058382264,0.58978766922,224.3447957019,0.00054049836,3.33757904879,853.196381752,0.0004579093,0.30331527632,14.2270940016,0.00041976402,2.62591355948,199.0720014364,0.00044697175,0.90661238256,63.7358983034,0.00025199575,5.08963506006,216.4804891757,0.00024640836,2.95445247282,210.1177017003,0.00024835151,4.02630190571,415.5524906121,0.00025545907,0.06626229252,117.3198682202,0.00029666833,6.09910638345,735.8765135318,0.00023396742,3.96337393635,647.0108333148,0.00023380691,4.90051072276,149.5631971346,0.00020272215,2.34319548198,309.2783226558,0.00020099552,0.98365186365,522.5774180938,0.0002482795,3.926814289,74.7815985673,0.00015383927,3.10227822627,277.0349937414,0.0001162921,5.74108283772,1059.3819301892,0.00012422966,2.62557865743,490.3340891794,0.00012048048,4.09265980116,351.8165923087],[0.05373889135,0,0,0.03090575152,2.70346890906,426.598190876,0.02741594312,4.26667636015,206.1855484372,0.02647489677,3.76132298889,220.4126424388,0.00631520527,5.0324550528,7.1135470008,0.00256799701,1.95351819758,639.897286314,0.0031227193,3.25850205023,419.4846438752,0.00189433319,2.91501840819,433.7117378768,0.00164133553,5.29239290066,213.299095438,0.00116791227,5.8914667576,110.2063212194,0.00067210919,2.17042636344,316.3918696566,0.00067003292,3.63101075514,227.5261894396,0.00033002406,4.35527405801,199.0720014364,0.00030628998,4.88861760772,14.2270940016,0.00022234714,4.62212779231,103.0927742186,0.00018945004,1.20412493845,853.196381752,0.00018079959,3.51566153251,209.3669421749,0.00017791543,4.53214140649,217.2312487011,0.00016320701,3.2978403097,216.4804891757,0.00015944258,4.74503265169,210.1177017003,0.00016717122,3.00270792752,632.7837393132,0.00016149947,4.04186432517,323.5054166574,0.00014481431,2.1029829865,647.0108333148,0.0001108404,4.74073871754,117.3198682202],[0.00563706537,5.97115878242,206.1855484372,0.00547012116,2.05154973426,220.4126424388,0.00458518613,0,0,0.00362294249,0.89540100509,213.299095438,0.00225521642,0.91699821445,426.598190876,0.00088390611,3.30289449917,7.1135470008,0.00050101314,1.12976163835,433.7117378768,0.00045516403,5.07669466539,419.4846438752,0.00032896745,0.02089057938,639.897286314,0.00027199743,1.9263841764,227.5261894396,0.00013251505,6.07693099404,199.0720014364,0.00010425984,3.18246869028,14.2270940016],[0.00077376615,1.40391048961,206.1855484372,0.00075564351,0.31962896379,220.4126424388,0.00022843837,3.14159265359,0,0.00010672263,5.3649566382,426.598190876]],
	z: [[0.4135695094,3.60234142982,213.299095438,0.01148283576,2.85128367469,426.598190876,0.01214249867,0,0,0.00329280791,0.57121407104,206.1855484372,0.00286934048,3.48073526693,220.4126424388,0.00099076584,4.73369511264,7.1135470008,0.0005736182,4.92611225093,110.2063212194,0.00047738127,2.10039779728,639.897286314,0.00043458803,5.84904978051,419.4846438752,0.00034565673,5.4261422959,316.3918696566,0.00016185391,2.72987173675,433.7117378768,0.00011433574,3.71662021072,529.6909650946],[0.01906503283,4.94544746116,213.299095438,0.00528301265,3.14159265359,0,0.00130262284,2.26140980879,206.1855484372,0.00101466332,1.79095829545,220.4126424388,0.00085947578,0.51612788497,426.598190876,0.00022257446,3.07684015656,7.1135470008,0.00016179946,1.19987517506,419.4846438752],[0.00131275155,0.08868998101,213.299095438,0.00030147649,3.91396203887,206.1855484372,0.00019322173,0.09228748624,220.4126424388]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_ura(tj) { return vsop87(vsop87a_ura.coeffs, tj); }
function vsop87a_ura_xyz(tj) { return vsop87.xyz(vsop87a_ura.coeffs, tj); }
vsop87a_ura.xyz = vsop87a_ura_xyz; // assign
vsop87a.ura = vsop87a_ura; // export
vsop87a_ura.coeffs = {
	x: [[19.17370730359,5.48133416489,74.7815985673,1.32272523872,0,0,0.44402496796,1.65967519586,149.5631971346,0.14668209481,3.42395862804,73.297125859,0.14130269479,4.39572927934,76.2660712756,0.06201106178,5.14043574125,1.4844727083,0.01542951343,4.12121838072,224.3447957019,0.0144421666,2.65117115201,148.0787244263,0.00944995563,1.65869338757,11.0457002639,0.00657524815,0.57595170636,151.0476698429,0.00621624676,3.05882246638,77.7505439839,0.00585182542,4.79934779678,71.8126531507,0.0063400027,4.09556589724,63.7358983034,0.00547699056,3.63127725056,85.8272988312,0.00458219984,3.90788284112,2.9689454166,0.00496087649,0.59947400861,529.6909650946,0.00383625535,6.18762010576,138.5174968707,0.00267938156,0.96885660137,213.299095438,0.00215368005,5.30877641428,38.1330356378,0.00145505389,2.31759757085,70.8494453042,0.00135340032,5.51062460816,78.7137518304,0.00119593859,4.10138544267,39.6175083461,0.00125105686,2.51455273063,111.4301614968,0.00111260244,5.12252784325,222.8603229936,0.00104619827,3.90538916334,146.594251718,0.00110125387,4.45473528724,35.1640902212,0.00063584588,0.29966233158,299.1263942692,0.00053904041,3.92590422507,3.9321532631,0.00065066905,3.73008452906,109.9456887885,0.00039181662,2.68841280769,4.4534181249,0.00034341683,3.03781661928,225.8292684102,0.00033134636,2.54201591218,65.2203710117,0.00034555652,1.84699329257,79.2350166922,0.0003386705,5.98418436103,70.3281804424,0.00028371614,2.58026657123,127.4717966068,0.00035943348,4.08754543016,202.2533951741,0.00025208833,5.30272144657,9.5612275556,0.00023467802,4.09729860322,145.6310438715,0.00022963939,5.51475073655,84.3428261229,0.00031823951,5.53948583244,152.5321425512,0.00028384953,6.01785430306,184.7272873558,0.00026657176,6.11027939727,160.6088973985,0.00019676762,5.53431398332,74.6697239827,0.00019653873,2.28660913421,74.8934731519,0.0001995428,0.57450958037,12.5301729722,0.00018565067,0.62225019017,52.6901980395,0.00020084756,4.47297488471,22.0914005278,0.00019926329,1.39878194708,112.9146342051,0.00018575632,5.7021747579,33.6796175129,0.0001658787,4.86920309163,108.4612160802,0.00015171194,2.88415453399,41.1019810544,0.000112458,6.11597016146,71.6002048296,0.00013948521,6.2754569416,221.3758502853,0.0001079835,1.70031857078,77.962992305,0.00013593955,2.55407820633,87.3117715395,0.00011997848,0.94875212305,1059.3819301892,0.00012884351,5.0873799947,145.1097790097,0.00012394786,6.2189287885,72.3339180125,0.00012253318,0.19452856525,36.6485629295,0.00011538642,1.77241794539,77.2292791221],[0.00739730021,6.01067825116,149.5631971346,0.00526878306,3.14159265359,0,0.00239840801,5.33657762707,73.297125859,0.00229676787,2.48204455775,76.2660712756,0.00111045158,5.5715723596,11.0457002639,0.00096352822,0.35070389084,63.7358983034,0.0008151187,1.21058618039,85.8272988312,0.00045687564,2.29216583843,138.5174968707,0.00051382501,2.1893512526,224.3447957019,0.0003884433,0.30724575951,70.8494453042,0.00036158493,1.23634798757,78.7137518304,0.00032333094,5.06666556704,74.7815985673,0.00021685656,4.93710968392,151.0476698429,0.0001944197,1.30617490304,77.7505439839,0.00017376241,0.2460722123,71.8126531507,0.00015211071,5.5314163314,3.9321532631],[0.00016015732,3.83700026619,74.7815985673,0.00010915299,3.0298777627,149.5631971346]],
	y: [[19.16518231584,3.91045677002,74.7815985673,0.44390465203,0.08884111329,149.5631971346,0.16256125476,3.14159265359,0,0.14755940186,1.85423280679,73.297125859,0.14123958128,2.82486076549,76.2660712756,0.06250078231,3.56960243857,1.4844727083,0.01542668264,2.55040539213,224.3447957019,0.01442356575,1.08004542712,148.0787244263,0.00938975501,0.09275714761,11.0457002639,0.00650331846,2.76142680222,63.7358983034,0.0065734312,5.28830704469,151.0476698429,0.0062132677,1.48795811387,77.7505439839,0.00541961958,3.24476486661,71.8126531507,0.00547472694,2.06037924573,85.8272988312,0.0045958912,2.3374553607,2.9689454166,0.00495936105,5.3120575374,529.6909650946,0.00387922853,4.62026923885,138.5174968707,0.00268363417,5.6808529902,213.299095438,0.00216239629,3.7380076758,38.1330356378,0.00144032475,0.7501570092,70.8494453042,0.0013529082,3.93970260616,78.7137518304,0.00119670613,2.5305878378,39.6175083461,0.00124868545,0.94315917319,111.4301614968,0.0011120486,3.55163219419,222.8603229936,0.00104507929,2.33345675603,146.594251718,0.00108584454,6.02234848388,35.1640902212,0.00063573747,5.0120496792,299.1263942692,0.00053289771,2.38437587876,3.9321532631,0.00063774261,2.15607602904,109.9456887885,0.00039218598,1.11841109252,4.4534181249,0.00034205426,0.92405922576,65.2203710117,0.00034334377,1.46696169843,225.8292684102,0.00034538316,0.27613780697,79.2350166922,0.00039256771,5.75956853703,202.2533951741,0.00026157754,3.74097610798,9.5612275556,0.00023427328,2.52740125551,145.6310438715,0.00022933138,3.9445554035,84.3428261229,0.00031816303,3.96860170484,152.5321425512,0.00025237176,4.45141413666,70.3281804424,0.00028372491,4.44714627097,184.7272873558,0.00026652859,4.53944395347,160.6088973985,0.00019666208,3.96350065335,74.6697239827,0.00019643845,0.71577796385,74.8934731519,0.00019838981,5.29113397354,12.5301729722,0.00021523908,4.93565132068,36.6485629295,0.00015537967,1.8786327546,52.6901980395,0.000201151,3.45473780762,127.4717966068,0.00020051641,2.90386352937,22.0914005278,0.00019901477,6.11075402434,112.9146342051,0.00018126776,0.98478853787,33.6796175129,0.00015174962,1.31314034959,41.1019810544,0.0001123902,4.54508334011,71.6002048296,0.00013948849,4.70474945682,221.3758502853,0.00010819728,0.12807029856,77.962992305,0.00013589665,0.9831371993,87.3117715395,0.00011996772,5.66129275335,1059.3819301892,0.00012407787,4.6494578334,72.3339180125,0.0001153114,0.20190074645,77.2292791221],[0.02157896385,0,0,0.00739227349,4.43963890935,149.5631971346,0.00238545685,3.76882493145,73.297125859,0.00229396424,0.91090183978,76.2660712756,0.00110137111,4.00844441616,11.0457002639,0.00094979054,5.07141537066,63.7358983034,0.00081474163,5.92275367106,85.8272988312,0.00045457174,0.73292241207,138.5174968707,0.00051366974,0.61844114994,224.3447957019,0.00038296005,5.01873578671,70.8494453042,0.00036146116,5.94859452787,78.7137518304,0.00032420558,4.32617271732,74.7815985673,0.00021673269,3.36607263522,151.0476698429,0.00019425087,6.01842187783,77.7505439839,0.00017393206,4.96098895488,71.8126531507,0.00014991169,3.97176856758,3.9321532631],[0.00034812647,3.14159265359,0,0.00016589194,2.2955674062,74.7815985673,0.00010905147,1.45737963668,149.5631971346]],
	z: [[0.25878127698,2.61861272578,74.7815985673,0.01774318778,3.14159265359,0,0.00599316131,5.08119500585,149.5631971346,0.0019028189,1.61643841193,76.2660712756,0.00190881685,0.57869575952,73.297125859,0.00084626761,2.26030150166,1.4844727083,0.00030734257,0.23571721555,63.7358983034,0.00020842052,1.26054208091,224.3447957019,0.00019734273,6.04314677688,148.0787244263,0.0001253753,5.17169051466,11.0457002639,0.00014582864,6.14852037212,71.8126531507,0.00010407529,3.65320417038,213.299095438,0.00011261541,3.55973769686,529.6909650946],[0.00655916626,0.0127194766,74.7815985673,0.00049648951,0,0,0.00023874178,2.7387049122,149.5631971346],[0.00014697858,1.75149165003,74.7815985673]]
}; // assign
;
// generated by vsop87.pl
function vsop87a_nep(tj) { return vsop87(vsop87a_nep.coeffs, tj); }
function vsop87a_nep_xyz(tj) { return vsop87.xyz(vsop87a_nep.coeffs, tj); }
vsop87a_nep.xyz = vsop87a_nep_xyz; // assign
vsop87a.nep = vsop87a_nep; // export
vsop87a_nep.coeffs = {
	x: [[30.05890004476,5.31211340029,38.1330356378,0.27080164222,3.14159265359,0,0.13505661755,3.50078975634,76.2660712756,0.15726094556,0.11319072675,36.6485629295,0.14935120126,1.08499403018,39.6175083461,0.02597313814,1.99590301412,1.4844727083,0.01074040708,5.38502938672,74.7815985673,0.00823793287,1.43221581862,35.1640902212,0.00817588813,0.78180174031,2.9689454166,0.00565534918,5.98964907613,41.1019810544,0.00495719107,0.59948143567,529.6909650946,0.00307525907,0.40023311011,73.297125859,0.00272253551,0.87443494387,213.299095438,0.00135887219,5.54676577816,77.7505439839,0.00090965704,1.68910246115,114.3991069134,0.00069040539,5.8346912352,4.4534181249,0.00060813556,2.6258995838,33.6796175129,0.00054690827,1.55799996661,71.8126531507,0.0002888926,4.78966826027,42.5864537627,0.00012614732,3.57002516434,112.9146342051,0.00012749153,2.73719269645,111.4301614968,0.00012013994,0.94912933496,1059.3819301892],[0.00255840261,2.01935686795,36.6485629295,0.00243125299,5.46214902873,39.6175083461,0.00118398168,2.88251845061,76.2660712756,0.00037965449,3.14159265359,0,0.00021924705,3.20156164152,35.1640902212,0.00017459808,4.26349398817,41.1019810544,0.00013130617,5.36424961848,2.9689454166]],
	y: [[30.06056351665,3.74086294714,38.1330356378,0.30205857683,3.14159265359,0,0.13506391797,1.92953034883,76.2660712756,0.15706589373,4.82539970129,36.6485629295,0.14936165806,5.79694900665,39.6175083461,0.02584250749,0.42549700754,1.4844727083,0.01073739772,3.81371728533,74.7815985673,0.00815187583,5.49429775826,2.9689454166,0.00582199295,6.19633718936,35.1640902212,0.00565576412,4.41843009015,41.1019810544,0.00495581047,5.31205825784,529.6909650946,0.00304525203,5.11048113661,73.297125859,0.00272640298,5.58603690785,213.299095438,0.00135897385,3.97553750964,77.7505439839,0.00090970871,0.11783619888,114.3991069134,0.00068790261,4.26391997151,4.4534181249,0.00028893355,3.21848975032,42.5864537627,0.00020081559,1.19787916085,33.6796175129,0.00012613583,1.99777332934,112.9146342051,0.00012828708,1.16740053443,111.4301614968,0.00012012961,5.66157563804,1059.3819301892],[0.00352947493,3.14159265359,0,0.00256125493,0.44757496817,36.6485629295,0.00243147725,3.89099798696,39.6175083461,0.00118427205,1.31128027037,76.2660712756,0.00021936702,1.63124087591,35.1640902212,0.00017462332,2.69229902966,41.1019810544,0.0001299238,3.79578633002,2.9689454166]],
	z: [[0.92866054405,1.44103930278,38.1330356378,0.01245978462,0,0,0.00474333567,2.52218774238,36.6485629295,0.00451987936,3.50949720541,39.6175083461,0.00417558068,5.91310695421,76.2660712756,0.00084104329,4.38928900096,1.4844727083,0.00032704958,1.52048692001,74.7815985673,0.00030873335,3.29017611456,35.1640902212,0.00025812584,3.19303128782,2.9689454166,0.00016865319,2.13251104425,41.1019810544,0.00011789909,3.60001877675,213.299095438,0.0001127968,3.55816676334,529.6909650946],[0.00154885971,2.14239039664,38.1330356378]]
}; // assign
;
})(vsop87a)
/* crc: 6BE556437F40BCD81DB783C3EB5CFE5B */
