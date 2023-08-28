
console.log('Scripts loaded');

const TRANSITION_DUR_MS = 400;

let d1 = document.querySelector("#d1");


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
    increment_sec_digit(d3,10,-1,5); //floor of 5
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
    // DEAL WITH 0:00 SOMEHOW...
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
    //First case: when decreasing (by 1 or 5)
    if (change < 0 && pct_int + change > 0) {
        pct_int = pct_int + change;
    } else if (change > 0 && pct_int + change <= 200) {
        pct_int = pct_int + change;
    }
    pct_text.textContent = pct_int;
    updateResult();
}

// Change the percent / speed text
let pace_speed_text = document.querySelector('.pace-speed-text');
const checkbox = document.querySelector('.switch input[type="checkbox"]');

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


function parse_pace(s){
    //Split '9:30' into [9,30] (array of Numbers)
    pace_arr = s.split(':').map((si) => parseInt(si))
    //Return as decimal minutes per (mile | km | 400)
    return pace_arr[0] + pace_arr[1]/60
}

// Any time ANY button is pressed or checkbox is flipped...
// we should fire an updateResult() event

// relevant variables:
// pct_int - integer percentage
// parseInt(d1.textContent)
// ... for d2 and d3

let new_result = 1;

function updateResult(){
    // Construct current pace input
    let current_input = parseInt(d1.textContent) + parseInt(d2.textContent + d3.textContent)/60
    // conditional on calcs...
    if (checkbox.checked) {
        //percent of pace
        new_result = current_input * (2 - pct_int/100)
    } else {
        //percent of speed
        new_result = current_input*100/pct_int
    }
    
    new_string = decimal_pace_to_string(new_result)
    //Update...
    if (new_string === '0:00'){
        //hmm...
        calc_text_span.textContent = '🤔'
    } else {
        calc_text_span.textContent = new_string
    }
    convertPace();
}

function decimal_pace_to_string(pace_decimal){
    let pace_min = Math.floor(pace_decimal)
    //Could be zero!! 
    
    let pace_sec = (pace_decimal - pace_min)*60
    //e.g. 9.50 --> 30 
    //Deal with e.g. 3:59.9 --> 4:00.0
    if (Math.round(pace_sec) === 60) {
        pace_sec = 0
        pace_min = pace_min+1;
    } else {
        pace_sec = Math.round(pace_sec);
    }
    //To formatted string
    res = `${pace_min}:${pace_sec.toString().padStart(2,'0')}` 
    return res
}


// So the swap button...should swap:

//First let's just make the button itself rotate
flip_button = document.querySelector('.flip-button');
console.log(flip_button)

flip_button.addEventListener('click', () => {
    let at_of_label = document.querySelector('.spacer-label');
    if (flip_button.classList.contains('flipped')) {
        //when not flipped, it is 6:00 at..."
        at_of_label.textContent = 'at'
        //fire flip callback
        flip_button.classList.remove('flipped');
        swapBoxes();
    } else {
        at_of_label.textContent = 'of'
        //fire flip callback
        flip_button.classList.add('flipped');
        swapBoxes();
    }
    convertPace()
});


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
    
        setTimeout(() => {
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
    
        setTimeout(() => {
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
        convertPace();
        //Scroll so you can see it!
    });
});

to_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        to_buttons.forEach(btn => btn.classList.remove('active'));
        // Toggle the active state of the clicked button
        e.target.classList.toggle('active');
        setToUnitText(button);
        convertPace();
        document.getElementById('convert-res').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    });
});

//Lol now I need to actually do the unit conversion


//Define unit conversions

//from-unit | to-unit : function(pace_in_decimal_minutes) -> res_dec_min
const convert_dict = {
    // hack solution for unfinished selections
    '|': (x) => x,
    '/mi|': (x) => x,
    '/km|': (x) => x,
    '/400m|': (x) => x,
    '|/mi': (x) => x,
    '|/km': (x) => x,
    '|/400m': (x) => x,
    //now the actual conversions
    '/mi|/km': function (pace_string){
        pace_dec = parse_pace(pace_string) //now in decimal minutes
        conv_dec = pace_dec/1.609344 // km per mile
        return decimal_pace_to_string(conv_dec)
    },
    '/mi|/400m':function (pace_string){
        pace_dec = parse_pace(pace_string) 
        conv_dec = pace_dec/1609.344*400 //to 400s
        return decimal_pace_to_string(conv_dec)
    },
    '/km|/mi':function (pace_string){
        pace_dec = parse_pace(pace_string) 
        conv_dec = pace_dec/0.62137 // mi per km
        return decimal_pace_to_string(conv_dec)
    },
    '/km|/400m':function (pace_string){
        pace_dec = parse_pace(pace_string) 
        conv_dec = pace_dec/2.5 //400s per km
        return decimal_pace_to_string(conv_dec)
    },
    '/400m|/mi':function (pace_string){
        pace_dec = parse_pace(pace_string) 
        conv_dec = pace_dec/400*1609.344 // via min per meter
        return decimal_pace_to_string(conv_dec)
    },
    '/400m|/km':function (pace_string){
        pace_dec = parse_pace(pace_string) 
        conv_dec = pace_dec*2.5 // simple!
        return decimal_pace_to_string(conv_dec)
    },
}


//lol global variables
function convertPace() {
    //deal with ::hmm, deal with unit matches
    console.log(calc_text_span)
    const pace_res = document.querySelector(".pace-result").textContent;

    console.log('**************************')
    console.log(pace_res)

    console.log(convert_dict)
    console.log(`${from_units_string}|${to_units_string}`)
    console.log('**************************')

    let converted_pace = '';

    //Cases to deal with: incomplete selection
    if (from_units_string === '' && to_units_string === '') {
        converted_pace = pace_res;
    } else if (from_units_string === to_units_string && from_units_string !== '') {
        converted_pace = pace_res;
        //DEAL WIHT 0:00 HERE
    } else {
        const convert_string = `${from_units_string}|${to_units_string}`
        const convert_fxn = convert_dict[convert_string]

        //use function
        converted_pace = convert_fxn(pace_res)
    }

    //Set with convertdd
    const convert_result_text = document.querySelector('#convert-res')
    convert_result_text.textContent = converted_pace
}





