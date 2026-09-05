const TRANSITION_DUR_MS = 400;

// Default state
const DEFAULT_STATE = {
    version: 1,
    dials: { d1: 5, d2: 0, d3: 0, d4: 0 },
    pct: 95,
    decimals_enabled: false,
    pace_mode: true,    // true = pace (checkbox checked)
    flip_mode: 'of',
    from_unit: '',
    to_unit: '',
    remember_pace: true
};

let remember_pace = true;

let d1 = document.querySelector("#d1");
let d2 = document.querySelector("#d2");
let d3 = document.querySelector("#d3");
const d1_up = document.querySelector('#d1-up');
const d1_down = document.querySelector('#d1-down');

d1_up.addEventListener('click', () => {
    increment_minutes(d1,1);
    updateResult();
});

d1_down.addEventListener('click', () => {
    increment_minutes(d1,-1);
    updateResult();
});

//Second incrementors - a bit different
const d2_up = document.querySelector('#d2-up');
const d2_down = document.querySelector('#d2-down');

d2_up.addEventListener('click', () => {
    increment_sec_digit(d2,6,1);
    updateResult();
});

d2_down.addEventListener('click', () => {
    increment_sec_digit(d2,6,-1);
    updateResult();
});

// 3rd digit is limit 10
const d3_up = document.querySelector('#d3-up');
const d3_down = document.querySelector('#d3-down');

d3_up.addEventListener('click', () => {
    increment_sec_digit(d3,10,1);
    updateResult();
});

d3_down.addEventListener('click', () => {
    increment_sec_digit(d3,10,-1);
    updateResult();
});

// Decimal digit (tenths of a second)
let d4 = document.querySelector("#d4");
const d4_up = document.querySelector('#d4-up');
const d4_down = document.querySelector('#d4-down');

d4_up.addEventListener('click', () => {
    increment_sec_digit(d4,10,1);
    updateResult();
});

d4_down.addEventListener('click', () => {
    increment_sec_digit(d4,10,-1);
    updateResult();
});

// .00 button toggle
const decimal_toggle = document.querySelector('#decimal-toggle');
const decimal_container = document.querySelector('#decimal-container');
let decimals_enabled = false;

decimal_toggle.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const wasDisabled = btn.classList.toggle('is-disabled');
    decimal_container.classList.toggle('hidden', wasDisabled);

    if (wasDisabled) {
        // Toggled OFF: force decimal to 0 so user doesn't carry a hidden value
        d4.textContent = 0;
        decimals_enabled = false;
    } else {
        decimals_enabled = true;
    }
    updateResult();
});

function increment_sec_digit(digit_object, digit_limit, change){
    let digit_val = parseInt(digit_object.textContent);
    // mod ops to circularize
    if (change === 1) {
        digit_val = (digit_val + 1) % digit_limit;
    }
    if (change === -1) {
        digit_val = (digit_val - 1 + digit_limit) % digit_limit;
    }
    digit_object.textContent = digit_val;
}

function increment_minutes(digit_object,change){
    let digit_val = parseInt(digit_object.textContent);
    //Disallow > 60
    if (change > 0 && digit_val < 60) {
        digit_object.textContent = digit_val + change
    }
    //Disallow < 0
    if (digit_val > 0 && change < 0) {
        digit_object.textContent = digit_val + change
    }
}

// Percent changes
let pct_text = document.querySelector(".percent-digits")
let pct_int = parseInt(pct_text.textContent)

// In order left to right...
const pct_m5 = document.querySelector("#pct-m5")
pct_m5.addEventListener('click', () => {
    increment_pct(-5)
})

const pct_m1 = document.querySelector("#pct-m1")
pct_m1.addEventListener('click', () => {
    increment_pct(-1)
})

const pct_p1 = document.querySelector("#pct-p1")
pct_p1.addEventListener('click', () => {
    increment_pct(1)
})

const pct_p5 = document.querySelector("#pct-p5")
pct_p5.addEventListener('click', () => {
    increment_pct(5)
})

function increment_pct(change){
    //Clamp to 1-200 instead of rejecting the step (so -5 from 5% lands on 1%)
    pct_int = Math.min(200, Math.max(1, pct_int + change));
    pct_text.textContent = pct_int;
    updateResult();
}

// Change the percent / speed text
let pace_speed_text = document.querySelector('.pace-speed-text');
const checkbox = document.querySelector('#basis-toggle');

checkbox.addEventListener('change', () => {
    flip_pace_speed_text()
})

function flip_pace_speed_text(){
    if (checkbox.checked) {
        //percent of pace
        pace_speed_text.textContent = 'pace'
    } else {
        pace_speed_text.textContent = 'speed'
    }
    updateResult();
}


// Deal with changes of result
let calc_text_span = document.querySelector(".pace-result")


// Any time ANY button is pressed or checkbox is flipped...
// we should fire an updateResult() event

// relevant variables:
// pct_int - integer percentage
// parseInt(d1.textContent)
// ... for d2 and d3
let new_result = 1;

function updateResult(){
    // Construct current pace input
    let mode_string = document.querySelector('.spacer-label').textContent

    //when mode is 'of', that means we are finding pace = P percent of RP
    // (This is what is currently implemented)

    // when mode is 'is', we want what RP is P percent of Pace
    let seconds = parseInt(d2.textContent + d3.textContent);
    if (decimals_enabled) {
        seconds += parseInt(d4.textContent) / 10;
    }
    let current_input = parseInt(d1.textContent) + seconds / 60;


    if (mode_string === 'of') {
        // if using percent of PACE
        if (checkbox.checked) {
            //percent of pace
            new_result = current_input * (2 - pct_int/100)
        } else {
            //if using percent of speed
            new_result = current_input*100/pct_int
        }
    // ELSE using the inverse mode --> solve for original pace
    } else if (mode_string === 'is') {
        // if using percent of PACE
        if (checkbox.checked) {
            //percent of pace 
            new_result = current_input / (2-pct_int/100)
        } else {
            //if using percent of speed
            new_result = pct_int*current_input/100
        }
    }
    
    let new_string = decimals_enabled
        ? decimal_pace_to_string_dec(new_result)
        : decimal_pace_to_string(new_result);
    //Update...
    if (new_string === '0:00' || new_string === '0:00.0' || !Number.isFinite(new_result)){
        //hmm...
        calc_text_span.textContent = '🤔'
    } else {
        // Drop leading 0: for sub-minute results (e.g. '0:50.1' -> '50.1')
        if (new_string.substring(0, 2) === '0:') {
            new_string = new_string.substring(2);
        }
        calc_text_span.textContent = new_string
    }
    convertPace();
}

function decimal_pace_to_string(pace_decimal){
    //Round on whole seconds, so exact half-seconds round up and 3:59.6 --> 4:00
    let total_sec = Math.round(pace_decimal*60)
    let pace_min = Math.floor(total_sec/60)
    //Could be zero!!
    let pace_sec = total_sec % 60
    //To formatted string
    let res = `${pace_min}:${pace_sec.toString().padStart(2,'0')}`
    return res
}


//Could it be this easy? e.g. to get 1:18.2
function decimal_pace_to_string_dec(pace_decimal){
    //Round on whole tenths of a second - no edge cases, and exact ties round up
    let total_tenths = Math.round(pace_decimal*600)
    let pace_min = Math.floor(total_tenths/600)
    //Could be zero!!
    let pace_sec_floor = Math.floor(total_tenths/10) % 60
    let pace_sec_tenths = total_tenths % 10
    //To formatted string
    let res = `${pace_min}:${pace_sec_floor.toString().padStart(2,'0')}.${pace_sec_tenths.toString()}`
    return res
}

// So the swap button...should swap:
//First let's just make the button itself rotate
const flip_button = document.querySelector('.flip-button');

flip_button.addEventListener('click', () => {
    let at_of_label = document.querySelector('.spacer-label');
    let equals_of_label = document.querySelector('.equals');

    if (flip_button.classList.contains('flipped')) {
        //when not flipped, it is 6:00 at..."
        at_of_label.textContent = 'of'
        equals_of_label.textContent = 'equals'
        //fire flip callback
        flip_button.classList.remove('flipped');
        swapBoxes();
    } else {
        at_of_label.textContent = 'is'
        equals_of_label.textContent = 'of'
        //fire flip callback
        flip_button.classList.add('flipped');
        swapBoxes();
    }
    updateResult();
});

//Pending swapBoxes() animation, so a reset mid-flip can cancel it
let swap_timeout_id = null;

function cancelSwapBoxes() {
    if (swap_timeout_id === null) {
        return;
    }
    clearTimeout(swap_timeout_id);
    swap_timeout_id = null;
    //The cancelled callback would have cleaned these up
    const box1 = document.querySelector('.pace-box');
    const box2 = document.querySelector('.spacer');
    const box3 = document.querySelector('.percent-box');
    box1.style.transform = '';
    box2.style.transform = '';
    box3.style.transform = '';
    box2.style.opacity = '1';
}

//thx ChatGPT
function swapBoxes() {
    //box1 - pace-box, box2 - spacer, box3 - percent-box
    let mainContent = document.querySelector('.flip-container');

    const box1 = document.querySelector('.pace-box');
    const box2 = document.querySelector('.spacer');
    const box3 = document.querySelector('.percent-box');

    // Get computed styles for margins
    const styleBox1 = window.getComputedStyle(box1);
    const styleBox2 = window.getComputedStyle(box2);
    const styleBox3 = window.getComputedStyle(box3);

    // Calculate total heights including margins
    const totalBox1Height = box1.offsetHeight + parseInt(styleBox1.marginTop) + parseInt(styleBox1.marginBottom);
    const totalBox2Height = box2.offsetHeight + parseInt(styleBox2.marginTop) + parseInt(styleBox2.marginBottom);
    const totalBox3Height = box3.offsetHeight + parseInt(styleBox3.marginTop) + parseInt(styleBox3.marginBottom);

    if (box1.nextElementSibling === box2) {
        // Moving box1 down and box3 up
        box2.style.opacity = '0'; // Hide, then show later
        box1.style.transform = `translateY(${totalBox2Height + totalBox3Height}px)`;
        //box2.style.transform = `translateY(${totalBox3Height - totalBox1Height}px)`;
        box3.style.transform = `translateY(-${totalBox1Height + totalBox2Height}px)`;
    
        swap_timeout_id = setTimeout(() => {
            swap_timeout_id = null;
            mainContent.insertBefore(box3, box1);
            mainContent.insertBefore(box1, null);  // Place box1 at the end

            // Reset the transforms
            box1.style.transform = '';
            box3.style.transform = '';
            box2.style.opacity = '1';
        }, TRANSITION_DUR_MS);

    } else {
        // Moving box3 down and box1 up
        box2.style.opacity = '0';
        box1.style.transform = `translateY(-${totalBox2Height + totalBox3Height}px)`;
        // No translation for box2
        box2.style.transform = `translateY(${totalBox1Height - totalBox3Height}px)`;
        box3.style.transform = `translateY(${totalBox1Height + totalBox2Height}px)`;
    
        swap_timeout_id = setTimeout(() => {
            swap_timeout_id = null;
            mainContent.insertBefore(box1, box3);
            mainContent.insertBefore(box3, null);  // Place box3 at the end

            // Reset the transforms
            box1.style.transform = '';
            box2.style.transform = '';
            box3.style.transform = '';
            box2.style.opacity = '1';
        }, TRANSITION_DUR_MS);
    }
};

// lol globals
let from_units_string = '';
let to_units_string = '';

function setFromUnitText(button){
    const from_units = document.querySelector('.convert-units')
    from_units_string = button.textContent
    from_units.textContent = button.textContent
}

function setToUnitText(button){
    const to_units = document.querySelector('.result-units')
    to_units_string = button.textContent
    to_units.textContent = button.textContent
}

// Unit button parsing
const from_buttons = document.querySelectorAll('.from-units .unit-toggle');
const to_buttons = document.querySelectorAll('.to-units .unit-toggle');

from_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        from_buttons.forEach(btn => btn.classList.remove('active'));
        // Toggle the active state of the clicked button
        e.target.classList.toggle('active');
        setFromUnitText(button);
        // Auto-enable decimals for sub-minute split units
        if (button.textContent === '/400m' || button.textContent === '/200m') {
            if (!decimals_enabled) {
                decimal_toggle.classList.remove('is-disabled');
                decimal_container.classList.remove('hidden');
                decimals_enabled = true;
            }
        }
        updateResult();
    });
});

to_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        to_buttons.forEach(btn => btn.classList.remove('active'));
        // Toggle the active state of the clicked button
        e.target.classList.toggle('active');
        setToUnitText(button);
        updateResult();
        document.getElementById('convert-res').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    });
});

// Format a converted pace: use decimals if enabled, or always for /400m and /200m
function format_pace(dec_min, to_unit) {
    if (decimals_enabled || to_unit === '/400m' || to_unit === '/200m') {
        return decimal_pace_to_string_dec(dec_min);
    }
    return decimal_pace_to_string(dec_min);
}

// With only one unit picked there is nothing to convert - show the result as-is
const show_unconverted = (pace_dec) => format_pace(pace_dec, '');

//Define unit conversions - a dict of functions!
//from-unit | to-unit : function(pace_in_decimal_minutes) -> formatted string
const convert_dict = {
    // hack solution for unfinished unit selections
    '|': show_unconverted,
    '/mi|': show_unconverted,
    '/km|': show_unconverted,
    '/400m|': show_unconverted,
    '/200m|': show_unconverted,
    '|/mi': show_unconverted,
    '|/km': show_unconverted,
    '|/400m': show_unconverted,
    '|/200m': show_unconverted,
    '|mph': show_unconverted,
    '|km/h': show_unconverted,
    '|m/s': show_unconverted,
    //now the actual conversions
    '/mi|/km': function (pace_dec){
        let conv_dec = pace_dec/1.609344 // km per mile
        return format_pace(conv_dec, '/km')
    },
    '/mi|/400m':function (pace_dec){
        let conv_dec = pace_dec/1609.344*400 //to 400s
        return format_pace(conv_dec, '/400m')
    },
    '/mi|/200m':function (pace_dec){
        let conv_dec = pace_dec/1609.344*200
        return format_pace(conv_dec, '/200m')
    },
    '/mi|mph':function (pace_dec){
        // So this is in minutes per mile
        let conv_dec = 1/(pace_dec/60) 
        return conv_dec.toFixed(1);
    },
    '/mi|km/h':function (pace_dec){
        let conv_dec = 1/(pace_dec/1.609344/60) 
        return conv_dec.toFixed(1);
    },
    '/mi|m/s':function (pace_dec){
        let conv_dec = 1/(pace_dec*60/1609.344) 
        return conv_dec.toFixed(2);
    },
    '/km|/mi':function (pace_dec){
        let conv_dec = pace_dec/(1/1.609344) // mi per km
        return format_pace(conv_dec, '/mi')
    },
    '/km|/400m':function (pace_dec){
        let conv_dec = pace_dec/2.5 //400s per km
        return format_pace(conv_dec, '/400m')
    },
    '/km|/200m':function (pace_dec){
        let conv_dec = pace_dec/5 //200s per km
        return format_pace(conv_dec, '/200m')
    },
    '/km|mph':function (pace_dec){
        let conv_dec = 1/(pace_dec*1.609344/60) 
        return conv_dec.toFixed(1);
    },
    '/km|km/h':function (pace_dec){
        let conv_dec = 1/(pace_dec/60) 
        return conv_dec.toFixed(1);
    },
    '/km|m/s':function (pace_dec){
        let conv_dec = 1/(pace_dec*60/1000) 
        return conv_dec.toFixed(2);
    },
    '/400m|/mi':function (pace_dec){
        let conv_dec = pace_dec/400*1609.344 // via min per meter
        return format_pace(conv_dec, '/mi')
    },
    '/400m|/km':function (pace_dec){
        let conv_dec = pace_dec*2.5 // simple!
        return format_pace(conv_dec, '/km')
    },
    '/400m|mph':function (pace_dec){
        let conv_dec = 1/(pace_dec*1609.344/400/60) 
        return conv_dec.toFixed(1);
    },
    '/400m|km/h':function (pace_dec){
        let conv_dec = 1/(pace_dec*1000/400/60) 
        return conv_dec.toFixed(1);
    },
    '/400m|/200m':function (pace_dec){
        let conv_dec = pace_dec/2
        return format_pace(conv_dec, '/200m')
    },
    '/400m|m/s':function (pace_dec){
        let conv_dec = 1/(pace_dec/400*60)
        return conv_dec.toFixed(2);
    },
    // /200m conversions
    '/200m|/mi':function (pace_dec){
        let conv_dec = pace_dec/200*1609.344
        return format_pace(conv_dec, '/mi')
    },
    '/200m|/km':function (pace_dec){
        let conv_dec = pace_dec*5
        return format_pace(conv_dec, '/km')
    },
    '/200m|/400m':function (pace_dec){
        let conv_dec = pace_dec*2
        return format_pace(conv_dec, '/400m')
    },
    '/200m|mph':function (pace_dec){
        let conv_dec = 1/(pace_dec*1609.344/200/60)
        return conv_dec.toFixed(1);
    },
    '/200m|km/h':function (pace_dec){
        let conv_dec = 1/(pace_dec*1000/200/60)
        return conv_dec.toFixed(1);
    },
    '/200m|m/s':function (pace_dec){
        let conv_dec = 1/(pace_dec/200*60)
        return conv_dec.toFixed(2);
    }
}

//lol global variables
function convertPace() {
    //deal with ::hmm, deal with unit matches
    const pace_res = document.querySelector(".pace-result").textContent;


    let converted_pace = '';
    //Cases to deal with: incomplete selection
    if (pace_res === '🤔') {
        converted_pace = '🤔' // Hmm...
    } else if (from_units_string === to_units_string) {
        // Same unit (or neither picked): mirror the result line exactly
        converted_pace = pace_res;
    } else {
        //use function from dict, on the exact result - NOT the rounded display string
        const convert_string = `${from_units_string}|${to_units_string}`
        const convert_fxn = convert_dict[convert_string]
        converted_pace = convert_fxn(new_result)
    }
    // Drop leading 0: for sub-minute results (e.g. '0:57.0' -> '57.0')
    if (converted_pace.substring(0,2) === '0:') {
        converted_pace = converted_pace.substring(2);
    }
    //Set the result in DOM
    const convert_result_text = document.querySelector('#convert-res')
    convert_result_text.textContent = converted_pace
    // Only label the converted line once there is a real conversion to label
    document.querySelector('.result-units').textContent = from_units_string === '' ? '' : to_units_string;
}


// ============================================================
// COOKIE FUNCTIONS
// ============================================================

const BANNER_COOKIE_DAYS = 30;

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/;SameSite=Lax";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

function clearCookie(name) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax";
}

// --- State persistence (shared localStorage layer, rw-storage.js) ---
const APP_ID = 'pace-percent';   // localStorage key rw.pace-percent.v1

function saveState() {
    const state = {
        version: 1,
        dials: {
            d1: parseInt(d1.textContent),
            d2: parseInt(d2.textContent),
            d3: parseInt(d3.textContent),
            d4: parseInt(d4.textContent)
        },
        pct: pct_int,
        decimals_enabled: decimals_enabled,
        pace_mode: checkbox.checked,
        flip_mode: flip_button.classList.contains('flipped') ? 'is' : 'of',
        from_unit: from_units_string,
        to_unit: to_units_string,
        remember_pace: remember_pace
    };
    RWStorage.save(APP_ID, state, remember_pace);
}

function loadSavedState() {
    // Shared localStorage layer (rw-storage.js). Imports the old cookie once, then deletes it.
    const saved = RWStorage.load(APP_ID, { legacyCookie: 'pacePercentsCalc' });
    remember_pace = saved.remember;
    const remember_toggle_el = document.getElementById('remember-toggle');
    if (remember_toggle_el) remember_toggle_el.checked = remember_pace;
    if (!saved.state) return null;    try {
        const state = saved.state;
        if (state.version !== 1) return null;
        return state;
    } catch (e) {
        return null;
    }
}

function applyState(state) {
    // 1. Dials
    d1.textContent = state.dials.d1;
    d2.textContent = state.dials.d2;
    d3.textContent = state.dials.d3;
    d4.textContent = state.dials.d4;

    // 2. Percentage
    pct_int = state.pct;
    pct_text.textContent = state.pct;

    // 3. Decimals
    decimals_enabled = state.decimals_enabled;
    if (decimals_enabled) {
        decimal_toggle.classList.remove('is-disabled');
        decimal_container.classList.remove('hidden');
    } else {
        decimal_toggle.classList.add('is-disabled');
        decimal_container.classList.add('hidden');
    }

    // 4. Pace vs speed checkbox
    checkbox.checked = state.pace_mode;
    pace_speed_text.textContent = state.pace_mode ? 'pace' : 'speed';

    // 5. Flip mode (of vs is)
    const at_of_label = document.querySelector('.spacer-label');
    const equals_of_label = document.querySelector('.equals');
    const mainContent = document.querySelector('.flip-container');
    const box1 = document.querySelector('.pace-box');
    const box2 = document.querySelector('.spacer');
    const box3 = document.querySelector('.percent-box');
    // A flip animation still in flight would re-swap the boxes after we reorder them
    cancelSwapBoxes();

    // Set the order outright - a cancelled animation may have left it half-swapped
    if (state.flip_mode === 'is') {
        at_of_label.textContent = 'is';
        equals_of_label.textContent = 'of';
        flip_button.classList.add('flipped');
        // Flipped order: pace-box, spacer, percent-box
        mainContent.appendChild(box1);
        mainContent.appendChild(box2);
        mainContent.appendChild(box3);
    } else {
        at_of_label.textContent = 'of';
        equals_of_label.textContent = 'equals';
        flip_button.classList.remove('flipped');
        // Default order: percent-box, spacer, pace-box
        mainContent.appendChild(box3);
        mainContent.appendChild(box2);
        mainContent.appendChild(box1);
    }

    // 6. From/to unit buttons
    from_buttons.forEach(btn => btn.classList.remove('active'));
    if (state.from_unit) {
        from_buttons.forEach(btn => {
            if (btn.textContent === state.from_unit) {
                btn.classList.add('active');
            }
        });
        from_units_string = state.from_unit;
        document.querySelector('.convert-units').textContent = state.from_unit;
    } else {
        from_units_string = '';
        document.querySelector('.convert-units').textContent = '';
    }

    to_buttons.forEach(btn => btn.classList.remove('active'));
    if (state.to_unit) {
        to_buttons.forEach(btn => {
            if (btn.textContent === state.to_unit) {
                btn.classList.add('active');
            }
        });
        to_units_string = state.to_unit;
        document.querySelector('.result-units').textContent = state.to_unit;
    } else {
        to_units_string = '';
        document.querySelector('.result-units').textContent = '';
    }

    // 7. Compute result from restored state
    updateResult();
}

// --- Save on every state change ---
// Hook into updateResult to persist state
const _originalUpdateResult = updateResult;
updateResult = function() {
    _originalUpdateResult();
    saveState();
};

// Also save when unit buttons are clicked (from/to handlers already call convertPace,
// but the save needs to happen after from_units_string / to_units_string are updated)
// This is handled by the updateResult wrapper above since unit clicks trigger updateResult
// or convertPace which is called from updateResult.

// --- Reset button ---
const reset_button = document.getElementById('reset-button');
reset_button.addEventListener('click', () => {
    // Preserve the user's remember-pace preference across resets
    const preserved_remember = remember_pace;
    RWStorage.clear(APP_ID);
    applyState(DEFAULT_STATE);
    remember_pace = preserved_remember;
    saveState();
});

// --- Remember-pace toggle ---
const remember_toggle = document.getElementById('remember-toggle');
remember_toggle.addEventListener('change', () => {
    remember_pace = remember_toggle.checked;
    saveState();
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', function() {
    // Banner (separate cookie)
    const banner = document.querySelector('.mee-banner');
    const closeButton = document.getElementById('mee-banner-close');

    if (getCookie('meeBannerClosed') !== 'true') {
        banner.classList.remove('hidden');
    }

    closeButton.addEventListener('click', function() {
        banner.classList.add('hidden');
        setCookie('meeBannerClosed', 'true', BANNER_COOKIE_DAYS);
    });

    // Calculator state
    // loadSavedState() also restores the Remember-settings preference and toggle;
    // with the preference off it returns null, so the HTML defaults are used.
    const savedState = loadSavedState();
    if (savedState) {
        try {
            applyState(savedState);
        } catch (e) {
            RWStorage.clear(APP_ID);
            applyState(DEFAULT_STATE);
        }
    } else {
        updateResult();
    }
});
