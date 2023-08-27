
console.log('Scripts loaded');

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
    } else if (change > 0 && pct_int + change <= 150) {
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
    calc_text_span.textContent = new_string
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

