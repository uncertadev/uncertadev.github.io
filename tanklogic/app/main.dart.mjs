// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.setInt16),
      AD: x0 => x0.height,
      AE: x0 => x0.languages,
      AF: x0 => x0.deltaX,
      AG: x0 => x0.first(),
      AH: x0 => x0.value,
      AI: (a, i) => a.splice(i, 1),
      AJ: x0 => x0.naturalHeight,
      AK: (x0,x1) => x0.getContext(x1),
      AL: (x0,x1) => x0.querySelector(x1),
      AM: x0 => x0.toJSON(),
      AN: x0 => x0.refreshToken,
      AO: x0 => x0.vendorSub,
      AP: x0 => x0.hasPendingWrites,
      AQ: x0 => globalThis.firebase_firestore.doc(x0),
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (x0,x1) => x0.observe(x1),
      BF: x0 => x0.wheelDeltaY,
      BG: x0 => x0.next(),
      BH: x0 => x0.selectionDirection,
      BI: a => a.pop(),
      BJ: x0 => x0.naturalWidth,
      BK: (x0,x1) => new OffscreenCanvas(x0,x1),
      BL: (x0,x1) => { x0.id = x1 },
      BM: x0 => x0.uid,
      BN: x0 => x0.photoURL,
      BO: x0 => x0.productSub,
      BP: x0 => x0.metadata,
      BQ: x0 => x0.path,
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      CF: x0 => x0.wheelDeltaX,
      CG: x0 => x0.current(),
      CH: x0 => x0.selectionStart,
      CI: (map, o, v) => map.set(o, v),
      CJ: x0 => x0.decode(),
      CK: x0 => x0.allocationSize(),
      CL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CM: (x0,x1) => globalThis.firebase_auth.connectAuthEmulator(x0,x1),
      CN: x0 => x0.phoneNumber,
      CO: x0 => x0.product,
      CP: x0 => x0.toArray(),
      CQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.setInt8),
      DD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      DE: x0 => new ResizeObserver(x0),
      DF: x0 => x0.key,
      DG: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      DH: x0 => x0.selectionEnd,
      DI: () => new WeakMap(),
      DJ: (x0,x1) => { x0.decoding = x1 },
      DK: (x0,x1) => x0.copyTo(x1),
      DL: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      DM: x0 => x0.hostname,
      DN: x0 => x0.lastSignInTime,
      DO: x0 => x0.platform,
      DP: x0 => x0.toUint8Array(),
      DQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: Function.prototype.call.bind(DataView.prototype.getInt8),
      ED: x0 => x0.tabIndex,
      EE: (x0,x1) => x0.getPropertyValue(x1),
      EF: x0 => x0.identifier,
      EG: x0 => x0.v8BreakIterator,
      EH: x0 => x0.keyCode,
      EI: (map, o) => map.get(o),
      EJ: (x0,x1) => { x0.crossOrigin = x1 },
      EK: (x0,x1) => { x0.height = x1 },
      EL: x0 => x0.size,
      EM: x0 => x0.location,
      EN: x0 => x0.creationTime,
      EO: x0 => x0.languages,
      EP: () => globalThis.firebase_firestore.Bytes,
      EQ: (x0,x1) => globalThis.firebase_firestore.collection(x0,x1),
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      FD: (x0,x1) => x0.contains(x1),
      FE: x0 => globalThis.parseFloat(x0),
      FF: x0 => x0.touches,
      FG: () => globalThis.Intl,
      FH: (x0,x1) => x0.scrollIntoView(x1),
      FI: x0 => x0.message,
      FJ: (a, l) => a.length = l,
      FK: (x0,x1) => { x0.width = x1 },
      FL: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      FM: (x0,x1,x2) => ({errorMap: x0,persistence: x1,popupRedirectResolver: x2}),
      FN: x0 => x0.metadata,
      FO: x0 => x0.language,
      FP: () => globalThis.firebase_firestore.VectorValue,
      FQ: x0 => x0.length,
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: (x0,x1) => x0.getComputedStyle(x1),
      GF: x0 => x0.pressure,
      GG: (x0,x1) => x0.segment(x1),
      GH: x0 => x0.multiViewEnabled,
      GI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      GJ: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      GK: (x0,x1) => x0.toDataURL(x1),
      GL: (x0,x1) => x0.getContext(x1),
      GM: (x0,x1) => globalThis.firebase_auth.initializeAuth(x0,x1),
      GN: x0 => x0.isAnonymous,
      GO: x0 => x0.deviceMemory,
      GP: x0 => x0.longitude,
      GQ: x0 => x0.getReader(),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.documentElement,
      HF: x0 => x0.tiltY,
      HG: x0 => x0.index,
      HH: (x0,x1) => x0.replaceWith(x1),
      HI: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      HJ: (a, s, e) => a.slice(s, e),
      HK: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      HL: (x0,x1) => { x0.height = x1 },
      HM: () => globalThis.firebase_auth.browserPopupRedirectResolver,
      HN: x0 => x0.emailVerified,
      HO: x0 => x0.appVersion,
      HP: x0 => x0.latitude,
      HQ: x0 => x0.value,
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: x0 => x0.computedStyleMap(),
      IF: x0 => x0.tiltX,
      IG: x0 => x0.next(),
      IH: (x0,x1) => { x0.type = x1 },
      II: () => new AbortController(),
      IJ: o => o.byteLength,
      IK: (x0,x1) => x0.getContext(x1),
      IL: (x0,x1) => { x0.width = x1 },
      IM: () => globalThis.firebase_auth.debugErrorMap,
      IN: x0 => x0.email,
      IO: x0 => x0.appName,
      IP: () => globalThis.firebase_firestore.GeoPoint,
      IQ: x0 => x0.done,
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.target,
      JE: (x0,x1) => x0.get(x1),
      JF: x0 => x0.pointerType,
      JG: x0 => x0.value,
      JH: (x0,x1) => { x0.className = x1 },
      JI: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      JJ: () => new FileReader(),
      JK: x0 => x0.format,
      JL: x0 => x0.height,
      JM: () => globalThis.firebase_auth.browserSessionPersistence,
      JN: x0 => x0.displayName,
      JO: x0 => x0.appCodeName,
      JP: (x0,x1) => x0.data(x1),
      JQ: x0 => x0.read(),
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (o, p) => p in o,
      KF: x0 => x0.pointerId,
      KG: x0 => x0.done,
      KH: (x0,x1) => { x0.tabIndex = x1 },
      KI: (x0,x1) => globalThis.fetch(x0,x1),
      KJ: (x0,x1) => x0.readAsArrayBuffer(x1),
      KK: (x0,x1) => { x0.target = x1 },
      KL: x0 => x0.width,
      KM: () => globalThis.firebase_auth.browserLocalPersistence,
      KN: x0 => globalThis.firebase_auth.multiFactor(x0),
      KO: x0 => x0.onLine,
      KP: x0 => x0.nanoseconds,
      KQ: x0 => x0.assetBase,
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      LD: x0 => x0.clientX,
      LE: (x0,x1) => { x0.textContent = x1 },
      LF: x0 => x0.getCoalescedEvents(),
      LG: (o, m, a) => o[m].apply(o, a),
      LH: (x0,x1) => { x0.name = x1 },
      LI: (x0,x1) => x0.get(x1),
      LJ: x0 => x0.result,
      LK: (x0,x1,x2) => x0.insertBefore(x1,x2),
      LL: (x0,x1) => { x0.src = x1 },
      LM: () => globalThis.firebase_auth.indexedDBLocalPersistence,
      LN: x0 => x0.user,
      LO: (x0,x1) => ({timeout: x0,limitedUseAppCheckTokens: x1}),
      LP: x0 => x0.seconds,
      LQ: x0 => x0.loader,
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MF: (x0,x1) => x0.getModifierState(x1),
      MG: x0 => x0.iterator,
      MH: (x0,x1) => { x0.placeholder = x1 },
      MI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      MJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      MK: x0 => x0.id,
      ML: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MM: x0 => x0.code,
      MN: x0 => x0.idToken,
      MO: x0 => x0.data,
      MP: () => globalThis.firebase_firestore.Timestamp,
      MQ: () => globalThis._flutter,
      N: o => String(o),
      NB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      NC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      ND: x0 => x0.getBoundingClientRect(),
      NE: x0 => x0.matches,
      NF: s => s.trimLeft(),
      NG: () => globalThis.Symbol,
      NH: (x0,x1) => { x0.autocomplete = x1 },
      NI: (x0,x1) => x0.forEach(x1),
      NJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NK: x0 => x0.offsetHeight,
      NL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NM: x0 => x0.name,
      NN: x0 => x0.secret,
      NO: (x0,x1,x2) => globalThis.firebase_functions.httpsCallable(x0,x1,x2),
      NP: () => globalThis.firebase_firestore.DocumentReference,
      O: o => o === undefined,
      OB: x0 => new Uint16Array(x0),
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: (x0,x1) => x0.matchMedia(x1),
      OF: s => s.toUpperCase(),
      OG: (x0,x1) => new Intl.Segmenter(x0,x1),
      OH: (x0,x1) => { x0.name = x1 },
      OI: x0 => x0.name,
      OJ: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      OK: x0 => x0.offsetWidth,
      OL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OM: (x0,x1,x2,x3,x4,x5,x6,x7) => ({apiKey: x0,authDomain: x1,databaseURL: x2,projectId: x3,storageBucket: x4,messagingSenderId: x5,measurementId: x6,appId: x7}),
      ON: x0 => x0.accessToken,
      OO: (x0,x1) => globalThis.firebase_functions.httpsCallable(x0,x1),
      OP: x0 => x0.path,
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: x0 => x0.matches,
      PF: x0 => x0.pop(),
      PG: x0 => x0.Segmenter,
      PH: (x0,x1) => { x0.placeholder = x1 },
      PI: x0 => x0.statusText,
      PJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PK: x0 => x0.stopPropagation(),
      PL: (x0,x1) => { x0.onerror = x1 },
      PM: (x0,x1) => globalThis.firebase_core.initializeApp(x0,x1),
      PN: x0 => x0.signInMethod,
      PO: (x0,x1) => globalThis.firebase_functions.getFunctions(x0,x1),
      PP: x0 => x0.ref,
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      QC: (x0,x1) => x0.item(x1),
      QD: Date.now,
      QE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      QF: x0 => x0.flags,
      QG: x0 => x0.buffer,
      QH: (x0,x1) => { x0.action = x1 },
      QI: x0 => x0.url,
      QJ: () => new XMLHttpRequest(),
      QK: x0 => x0.disabled,
      QL: (x0,x1) => { x0.oncancel = x1 },
      QM: x0 => globalThis.firebase_core.initializeApp(x0),
      QN: x0 => x0.providerId,
      QO: (x0,x1,x2,x3) => x0.set(x1,x2,x3),
      QP: (x0,x1) => x0.get(x1),
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: f => f.dartFunction,
      RF: (a, s) => a.join(s),
      RG: x0 => x0.wasmMemory,
      RH: (x0,x1) => { x0.method = x1 },
      RI: x0 => x0.status,
      RJ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      RK: (x0,x1) => { x0.min = x1 },
      RL: (x0,x1) => { x0.onchange = x1 },
      RM: x0 => x0.storageBucket,
      RN: x0 => globalThis.firebase_auth.OAuthProvider.credentialFromResult(x0),
      RO: (x0,x1,x2) => x0.set(x1,x2),
      RP: x0 => globalThis.firebase_firestore.deleteDoc(x0),
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: x0 => new Float32Array(x0),
      SC: (x0,x1) => x0.querySelectorAll(x1),
      SD: (a, l) => a.length = l,
      SE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      SF: (x0,x1) => x0.error(x1),
      SG: () => globalThis.window._flutter_skwasmInstance,
      SH: (x0,x1) => { x0.noValidate = x1 },
      SI: x0 => x0.getReader(),
      SJ: x0 => x0.send(),
      SK: (x0,x1) => { x0.max = x1 },
      SL: x0 => x0.type,
      SM: x0 => x0.databaseURL,
      SN: x0 => x0.username,
      SO: (x0,x1) => new firebase_firestore.Timestamp(x0,x1),
      SP: () => globalThis.firebase_firestore.updateDoc,
      T: o => o instanceof RegExp,
      TB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      TC: (x0,x1) => x0.getAttribute(x1),
      TD: (x0,x1) => x0.closest(x1),
      TE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      TF: () => globalThis.console,
      TG: () => new TextDecoder(),
      TH: (x0,x1) => x0.removeAttribute(x1),
      TI: x0 => x0.read(),
      TJ: x0 => x0.type,
      TK: (x0,x1) => { x0.disabled = x1 },
      TL: x0 => x0.lastModified,
      TM: x0 => x0.apiKey,
      TN: x0 => x0.providerId,
      TO: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      TP: (x0,x1) => ({includeMetadataChanges: x0,source: x1}),
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: x0 => x0.bottom,
      UE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      UF: s => s.trimRight(),
      UG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      UH: x0 => x0.isConnected,
      UI: x0 => x0.value,
      UJ: x0 => x0.response,
      UK: (x0,x1) => { x0.scrollLeft = x1 },
      UL: x0 => x0.name,
      UM: x0 => x0.options,
      UN: x0 => x0.profile,
      UO: x0 => globalThis.firebase_firestore.increment(x0),
      UP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      V: o => o,
      VB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      VC: (x0,x1) => x0.appendChild(x1),
      VD: x0 => x0.top,
      VE: (o, i) => o[i],
      VF: x0 => x0.blur(),
      VG: x0 => x0.history,
      VH: x0 => x0.click(),
      VI: x0 => x0.done,
      VJ: (x0,x1) => { x0.responseType = x1 },
      VK: (x0,x1) => { x0.spellcheck = x1 },
      VL: (x0,x1) => x0.item(x1),
      VM: x0 => globalThis.firebase_core.getApp(x0),
      VN: x0 => x0.isNewUser,
      VO: () => globalThis.firebase_firestore.serverTimestamp(),
      VP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: x0 => new ArrayBuffer(x0),
      WC: (x0,x1) => x0.append(x1),
      WD: x0 => x0.right,
      WE: o => o.length,
      WF: x0 => x0.button,
      WG: x0 => x0.search,
      WH: (x0,x1) => x0.getElementsByClassName(x1),
      WI: x0 => x0.cancel(),
      WJ: x0 => x0.vendor,
      WK: (x0,x1) => { x0.disabled = x1 },
      WL: x0 => x0.length,
      WM: () => globalThis.firebase_core.getApp(),
      WN: x0 => globalThis.firebase_auth.getAdditionalUserInfo(x0),
      WO: () => globalThis.firebase_firestore.deleteField(),
      WP: (x0,x1,x2,x3) => globalThis.firebase_firestore.onSnapshot(x0,x1,x2,x3),
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.left,
      XE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      XF: x0 => x0.innerHeight,
      XG: x0 => x0.location,
      XH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      XI: x0 => x0.body,
      XJ: x0 => x0.navigator,
      XK: x0 => x0.canvasKitMaximumSurfaces,
      XL: x0 => x0.files,
      XM: () => globalThis.firebase_core.SDK_VERSION,
      XN: x0 => globalThis.firebase_auth.OAuthProvider.credentialFromError(x0),
      XO: x0 => ({merge: x0}),
      XP: (x0,x1,x2) => globalThis.firebase_firestore.onSnapshot(x0,x1,x2),
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientY,
      YE: x0 => x0.language,
      YF: x0 => x0.innerWidth,
      YG: x0 => x0.pathname,
      YH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      YI: x0 => x0.headers,
      YJ: () => globalThis.window,
      YK: x0 => x0.hostElement,
      YL: x0 => x0.target,
      YM: (x0,x1,x2) => globalThis.firebase_core.registerVersion(x0,x1,x2),
      YN: x0 => x0.session,
      YO: x0 => new firebase_firestore.FieldPath(x0),
      YP: x0 => globalThis.firebase_firestore.getDoc(x0),
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.clientX,
      ZE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      ZF: x0 => x0.height,
      ZG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      ZH: (x0,x1) => x0.dispatchEvent(x1),
      ZI: x0 => x0.signal,
      ZJ: (x0,x1) => x0.get(x1),
      ZK: x0 => x0.location,
      ZL: (x0,x1) => x0.replaceChildren(x1),
      ZM: (x0,x1) => x0.debug(x1),
      ZN: x0 => x0.phoneNumber,
      ZO: (x0,x1) => new firebase_firestore.FieldPath(x0,x1),
      ZP: x0 => globalThis.firebase_firestore.getDocFromServer(x0),
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.changedTouches,
      aE: () => globalThis.window.FinalizationRegistry,
      aF: x0 => x0.width,
      aG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      aH: (x0,x1) => x0.createEvent(x1),
      aI: (x0,x1) => x0.getRandomValues(x1),
      aJ: x0 => x0.body,
      aK: (x0,x1) => x0.getModifierState(x1),
      aL: (x0,x1,x2) => x0.setAttribute(x1,x2),
      aM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      aN: x0 => x0.uid,
      aO: (x0,x1,x2) => new firebase_firestore.FieldPath(x0,x1,x2),
      aP: x0 => globalThis.firebase_firestore.getDocFromCache(x0),
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      bC: x0 => x0.console,
      bD: x0 => x0.offsetY,
      bE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bF: x0 => x0.clientHeight,
      bG: o => Object.keys(o),
      bH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      bI: () => globalThis.crypto,
      bJ: x0 => x0.headers,
      bK: x0 => x0.metaKey,
      bL: (x0,x1) => { x0.accept = x1 },
      bM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bN: x0 => x0.enrollmentTime,
      bO: (x0,x1,x2,x3) => new firebase_firestore.FieldPath(x0,x1,x2,x3),
      bP: x0 => x0.source,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.offsetX,
      cE: x0 => new window.FinalizationRegistry(x0),
      cF: x0 => x0.clientWidth,
      cG: x0 => x0.state,
      cH: x0 => x0.readText(),
      cI: l => new DataView(new ArrayBuffer(l)),
      cJ: x0 => ({type: x0}),
      cK: x0 => x0.altKey,
      cL: (x0,x1) => { x0.multiple = x1 },
      cM: (x0,x1) => ({createScript: x0,createScriptURL: x1}),
      cN: x0 => x0.factorId,
      cO: (x0,x1,x2,x3,x4) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4),
      cP: x0 => ({source: x0}),
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.type,
      dE: (x0,x1) => x0.unregister(x1),
      dF: (x0,x1) => { x0.content = x1 },
      dG: x0 => x0.hash,
      dH: x0 => x0.clipboard,
      dI: (x0,x1) => x0.createObjectURL(x1),
      dJ: (x0,x1) => new Blob(x0,x1),
      dK: x0 => x0.ctrlKey,
      dL: (x0,x1) => { x0.type = x1 },
      dM: (x0,x1,x2) => x0.createPolicy(x1,x2),
      dN: x0 => x0.displayName,
      dO: (x0,x1,x2,x3,x4,x5) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5),
      dP: (x0,x1,x2) => globalThis.firebase_firestore.setDoc(x0,x1,x2),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.maxTouchPoints,
      eE: (x0,x1) => x0.contains(x1),
      eF: (x0,x1) => { x0.name = x1 },
      eG: x0 => x0.state,
      eH: (x0,x1) => x0.writeText(x1),
      eI: x0 => x0.URL,
      eJ: x0 => globalThis.URL.createObjectURL(x0),
      eK: x0 => x0.isComposing,
      eL: (x0,x1,x2,x3) => x0.decrypt(x1,x2,x3),
      eM: (x0,x1) => x0.createScriptURL(x1),
      eN: x0 => x0.hints,
      eO: (x0,x1,x2,x3,x4,x5,x6) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6),
      eP: (x0,x1) => globalThis.firebase_firestore.setDoc(x0,x1),
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o) => new DataView(b, o),
      fC: x0 => x0.length,
      fD: x0 => x0.platform,
      fE: (s) => +s,
      fF: x0 => x0.head,
      fG: (x0,x1) => x0.go(x1),
      fH: x0 => x0.unlock(),
      fI: x0 => new Blob(x0),
      fJ: (x0,x1) => x0.append(x1),
      fK: x0 => x0.code,
      fL: x0 => x0.subtle,
      fM: (x0,x1,x2) => x0.createScript(x1,x2),
      fN: x0 => x0.tenantId,
      fO: (x0,x1,x2,x3,x4,x5,x6,x7) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6,x7),
      fP: x0 => x0.metadata,
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: x0 => x0.body,
      gE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      gF: (x0,x1) => x0.removeChild(x1),
      gG: x0 => x0.parentElement,
      gH: (x0,x1) => x0.lock(x1),
      gI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      gJ: x0 => x0.click(),
      gK: x0 => x0.repeat,
      gL: x0 => x0.crypto,
      gM: (x0,x1) => x0.appendChild(x1),
      gN: x0 => x0.phoneNumber,
      gO: (x0,x1,x2,x3,x4,x5,x6,x7,x8) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6,x7,x8),
      gP: x0 => x0.doc,
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: () => globalThis.document,
      hE: s => s.trim(),
      hF: x0 => x0.firstChild,
      hG: (x0,x1) => x0.querySelectorAll(x1),
      hH: x0 => x0.orientation,
      hI: x0 => new window.ImageDecoder(x0),
      hJ: x0 => x0.remove(),
      hK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      hL: x0 => x0.isSecureContext,
      hM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      hN: x0 => x0.email,
      hO: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6,x7,x8,x9),
      hP: x0 => x0.newIndex,
      i: x0 => new Promise(x0),
      iB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      iC: (a, i) => a[i],
      iD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      iE: x0 => x0.classList,
      iF: x0 => x0.viewConstraints,
      iG: (d, digits) => d.toFixed(digits),
      iH: (x0,x1) => x0.querySelector(x1),
      iI: x0 => x0.name,
      iJ: x0 => globalThis.URL.revokeObjectURL(x0),
      iK: x0 => x0.userAgent,
      iL: (x0,x1,x2,x3,x4,x5,x6,x7) => x0.unwrapKey(x1,x2,x3,x4,x5,x6,x7),
      iM: (o, p) => delete o[p],
      iN: (x0,x1) => globalThis.firebase_auth.getMultiFactorResolver(x0,x1),
      iO: () => globalThis.firebase_firestore.documentId(),
      iP: x0 => x0.oldIndex,
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.hasFocus(),
      jE: x0 => x0.preventDefault(),
      jF: x0 => x0.hostElement,
      jG: x0 => x0.maxHeight,
      jH: (x0,x1) => { x0.title = x1 },
      jI: x0 => x0.repetitionCount,
      jJ: x0 => x0.body,
      jK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      jL: (x0,x1,x2,x3,x4,x5) => x0.importKey(x1,x2,x3,x4,x5),
      jM: (o, p, v) => o[p] = v,
      jN: x0 => x0.customData,
      jO: (x0,x1) => new firebase_firestore.GeoPoint(x0,x1),
      jP: x0 => x0.type,
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: (t, s) => t.set(s),
      kC: (x0,x1) => x0.test(x1),
      kD: x0 => x0.relatedTarget,
      kE: x0 => x0.parent,
      kF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kG: x0 => x0.maxWidth,
      kH: (x0,x1) => x0.vibrate(x1),
      kI: x0 => x0.frameCount,
      kJ: () => globalThis.document,
      kK: (x0,x1) => x0.removeItem(x1),
      kL: (x0,x1,x2,x3) => x0.generateKey(x1,x2,x3),
      kM: (x0,x1) => { x0.text = x1 },
      kN: x0 => x0.message,
      kO: x0 => globalThis.firebase_firestore.vector(x0),
      kP: x0 => x0.docChanges(),
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: x0 => x0.shiftKey,
      lE: x0 => x0.timeStamp,
      lF: x0 => ({runApp: x0}),
      lG: x0 => x0.minHeight,
      lH: x0 => x0.arrayBuffer(),
      lI: x0 => x0.selectedTrack,
      lJ: (x0,x1) => { x0.download = x1 },
      lK: x0 => x0.localStorage,
      lL: (x0,x1,x2,x3,x4) => x0.wrapKey(x1,x2,x3,x4),
      lM: (x0,x1) => { x0.text = x1 },
      lN: x0 => x0.code,
      lO: x0 => globalThis.firebase_firestore.Bytes.fromUint8Array(x0),
      lP: x0 => x0.docs,
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: (decoder, codeUnits) => decoder.decode(codeUnits),
      mE: (x0,x1) => x0.hasAttribute(x1),
      mF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      mG: x0 => x0.minWidth,
      mH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      mI: x0 => x0.completed,
      mJ: (x0,x1) => { x0.href = x1 },
      mK: (x0,x1,x2) => x0.setItem(x1,x2),
      mL: (x0,x1,x2) => x0.exportKey(x1,x2),
      mM: x0 => x0.trustedTypes,
      mN: (x0,x1) => globalThis.firebase_auth.signInWithCustomToken(x0,x1),
      mO: (x0,x1) => globalThis.firebase_firestore.doc(x0,x1),
      mP: x0 => globalThis.firebase_firestore.getDocs(x0),
      n: (o0, o1) => [o0, o1],
      nB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      nC: Function.prototype.call.bind(String.prototype.toLowerCase),
      nD: () => new TextDecoder("utf-8", {fatal: true}),
      nE: x0 => x0.buttons,
      nF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      nG: (x0,x1) => x0.removeProperty(x1),
      nH: x0 => x0.status,
      nI: x0 => x0.ready,
      nJ: (x0,x1) => x0.createElement(x1),
      nK: (x0,x1) => x0.getItem(x1),
      nL: x0 => x0.sessionStorage,
      nM: () => globalThis.console,
      nN: (x0,x1,x2) => globalThis.firebase_auth.signInWithEmailAndPassword(x0,x1,x2),
      nO: x0 => x0.commit(),
      nP: x0 => globalThis.firebase_firestore.getDocsFromServer(x0),
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: () => new TextDecoder("utf-8", {fatal: false}),
      oE: x0 => x0.ctrlKey,
      oF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      oG: (x0,x1) => x0.add(x1),
      oH: (x0,x1) => x0.fetch(x1),
      oI: x0 => x0.tracks,
      oJ: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      oK: (x0,x1) => x0.key(x1),
      oL: (x0,x1) => x0.getRandomValues(x1),
      oM: x0 => x0.trustedTypes,
      oN: (x0,x1,x2) => globalThis.firebase_auth.sendPasswordResetEmail(x0,x1,x2),
      oO: x0 => globalThis.firebase_firestore.writeBatch(x0),
      oP: x0 => globalThis.firebase_firestore.getDocsFromCache(x0),
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      pC: x0 => x0.vendor,
      pD: (a, i, v) => a[i] = v,
      pE: x0 => x0.y,
      pF: () => typeof dartUseDateNowForTicks !== "undefined",
      pG: x0 => x0.data,
      pH: x0 => x0.content,
      pI: () => globalThis.window.ImageDecoder,
      pJ: x0 => x0.arrayBuffer(),
      pK: x0 => x0.length,
      pL: (x0,x1,x2,x3) => x0.encrypt(x1,x2,x3),
      pM: (x0,x1) => { x0.crossOrigin = x1 },
      pN: (x0,x1,x2) => globalThis.firebase_auth.createUserWithEmailAndPassword(x0,x1,x2),
      pO: (x0,x1) => globalThis.firebase_firestore.getFirestore(x0,x1),
      pP: (x0,x1,x2) => globalThis.firebase_firestore.where(x0,x1,x2),
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: Function.prototype.call.bind(DataView.prototype.getInt32),
      qC: (x0,x1) => x0.createTextNode(x1),
      qD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      qE: x0 => x0.x,
      qF: () => Date.now(),
      qG: (x0,x1) => { x0.scrollTop = x1 },
      qH: x0 => x0.document,
      qI: x0 => x0.close(),
      qJ: (x0,x1) => x0.transferFromImageBitmap(x1),
      qK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qL: x0 => x0.measurementId,
      qM: () => globalThis.firebase_core.getApps(),
      qN: x0 => x0.tenantId,
      qO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qP: (x0,x1) => globalThis.firebase_firestore.query(x0,x1),
      r: (o, p) => o[p],
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      rC: (x0,x1) => { x0.id = x1 },
      rD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      rE: x0 => x0.scrollTop,
      rF: () => 1000 * performance.now(),
      rG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      rH: x0 => new WeakRef(x0),
      rI: (x0,x1) => x0.revokeObjectURL(x1),
      rJ: x0 => x0.height,
      rK: (x0,x1,x2) => x0.addEventListener(x1,x2),
      rL: x0 => x0.appId,
      rM: x0 => x0.reload(),
      rN: x0 => x0.signOut(),
      rO: x0 => ({maxAttempts: x0}),
      rP: () => globalThis.firebase_firestore.and,
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      sE: x0 => x0.offsetTop,
      sF: (x0,x1) => x0.requestAnimationFrame(x1),
      sG: (x0,x1) => { x0.value = x1 },
      sH: x0 => x0.deref(),
      sI: (x0,x1) => { x0.src = x1 },
      sJ: x0 => x0.width,
      sK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sL: x0 => x0.messagingSenderId,
      sM: (x0,x1) => globalThis.firebase_auth.sendEmailVerification(x0,x1),
      sN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sO: (x0,x1,x2) => globalThis.firebase_firestore.runTransaction(x0,x1,x2),
      sP: () => globalThis.firebase_firestore.or,
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: x0 => x0.visibilityState,
      tE: x0 => x0.scrollLeft,
      tF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      tH: () => globalThis.WeakRef,
      tI: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      tJ: x0 => x0.rasterEndMilliseconds,
      tK: (x0,x1) => { x0.src = x1 },
      tL: x0 => x0.authDomain,
      tM: x0 => x0.delete(),
      tN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      tP: x0 => globalThis.firebase_firestore.limitToLast(x0),
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      uE: x0 => x0.offsetLeft,
      uF: x0 => x0.now(),
      uG: (x0,x1) => { x0.value = x1 },
      uH: x0 => x0.debugSkipFontRetryDelay,
      uI: (x0,x1) => x0.decode(x1),
      uJ: x0 => x0.rasterStartMilliseconds,
      uK: (x0,x1) => { x0.type = x1 },
      uL: x0 => x0.projectId,
      uM: (x0,x1) => globalThis.firebase_auth.updatePassword(x0,x1),
      uN: (x0,x1,x2) => x0.onIdTokenChanged(x1,x2),
      uO: (o,s,v) => o[s] = v,
      uP: x0 => globalThis.firebase_firestore.limit(x0),
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: Function.prototype.call.bind(DataView.prototype.getInt16),
      vC: (x0,x1) => x0.attachShadow(x1),
      vD: x0 => x0.disconnect(),
      vE: x0 => x0.offsetParent,
      vF: x0 => x0.performance,
      vG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      vH: (x0,x1,x2) => x0.set(x1,x2),
      vI: x0 => x0.displayHeight,
      vJ: x0 => x0.imageBitmaps,
      vK: x0 => x0.head,
      vL: x0 => x0.name,
      vM: (x0,x1) => globalThis.firebase_auth.reauthenticateWithCredential(x0,x1),
      vN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      vO: () => Symbol("jsBoxedDartObjectProperty"),
      vP: () => globalThis.firebase_firestore.endBefore,
      w: (l, r) => l === r,
      wB: o => o instanceof Uint8ClampedArray,
      wC: (x0,x1) => x0.createElement(x1),
      wD: x0 => new Intl.Locale(x0),
      wE: (o, p, r) => o.replace(p, () => r),
      wF: x0 => new Uint8Array(x0),
      wG: x0 => x0.value,
      wH: x0 => x0.fontFallbackBaseUrl,
      wI: x0 => x0.displayWidth,
      wJ: (x0,x1) => { x0.height = x1 },
      wK: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      wL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      wM: (x0,x1) => globalThis.firebase_auth.EmailAuthProvider.credential(x0,x1),
      wN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      wO: (x0,x1,x2,x3) => x0.set(x1,x2,x3),
      wP: () => globalThis.firebase_firestore.endAt,
      x: x0 => x0.random(),
      xB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      xC: x0 => x0.scale,
      xD: x0 => x0.region,
      xE: (o, p, r) => o.replaceAll(p, () => r),
      xF: (x0,x1,x2) => x0.slice(x1,x2),
      xG: x0 => x0.selectionDirection,
      xH: (handle) => clearInterval(handle),
      xI: x0 => x0.duration,
      xJ: (x0,x1) => { x0.width = x1 },
      xK: x0 => x0.baseURI,
      xL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xM: x0 => x0.providerId,
      xN: x0 => x0.currentUser,
      xO: (x0,x1,x2) => x0.set(x1,x2),
      xP: () => globalThis.firebase_firestore.startAfter,
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: x0 => x0.script,
      yE: x0 => x0.deltaMode,
      yF: (x0,x1) => x0.decode(x1),
      yG: x0 => x0.selectionStart,
      yH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      yI: x0 => x0.image,
      yJ: x0 => x0.convertToBlob(),
      yK: x0 => x0.document,
      yL: (x0,x1,x2) => x0.onAuthStateChanged(x1,x2),
      yM: x0 => x0.providerData,
      yN: x0 => x0.maxTouchPoints,
      yO: x0 => ({serverTimestamps: x0}),
      yP: () => globalThis.firebase_firestore.startAt,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.language,
      zE: x0 => x0.deltaY,
      zF: (x0,x1) => x0.adoptText(x1),
      zG: x0 => x0.selectionEnd,
      zH: () => Date.now(),
      zI: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      zJ: (x0,x1,x2) => new ImageData(x0,x1,x2),
      zK: x0 => x0.abort(),
      zL: x0 => x0.call(),
      zM: x0 => x0.tenantId,
      zN: x0 => x0.hardwareConcurrency,
      zO: x0 => x0.fromCache,
      zP: (x0,x1) => globalThis.firebase_firestore.orderBy(x0,x1),

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
