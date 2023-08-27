
console.log('Scripts loaded');

let d1 = document.querySelector("#d1");

console.log(parseInt(d1.textContent))

const d1_up = document.querySelector('#d1-up');
const d1_down = document.querySelector('#d1-down');

d1_up.addEventListener('click', () => {
    console.log('Up clicked');
    increment_minutes(d1,1);
});

d1_down.addEventListener('click', () => {
    console.log('Down clicked');
    increment_minutes(d1,-1);
});

//Second incrementors - a bit different
const d2_up = document.querySelector('#d2-up');
const d2_down = document.querySelector('#d2-down');

d2_up.addEventListener('click', () => {
    console.log('Sec up clicked');
    increment_sec_digit(d2,6,1);
});

d2_down.addEventListener('click', () => {
    console.log('Sec up clicked');
    increment_sec_digit(d2,6,-1);
});

// 3rd digit is limit 10

const d3_up = document.querySelector('#d3-up');
const d3_down = document.querySelector('#d3-down');

d3_up.addEventListener('click', () => {
    console.log('Sec up clicked');
    increment_sec_digit(d3,10,1);
});

d3_down.addEventListener('click', () => {
    console.log('Sec up clicked');
    increment_sec_digit(d3,10,-1);
});


function increment_sec_digit(digit_object, digit_limit, change){
    let digit_val = parseInt(digit_object.textContent);
    console.log(digit_val);
    console.log('****')
    //GPT cleverness
    if (change === 1) {
        digit_val = (digit_val + 1) % digit_limit;
    }
    if (change === -1) {
        digit_val = (digit_val - 1 + digit_limit) % digit_limit;
    }
    digit_object.textContent = digit_val;

    console.log(digit_val)
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
    console.log(pct_int);
    increment_pct(-5)
})

const pct_m1 = document.querySelector("#pct-m1")
pct_m1.addEventListener('click', () => {
    console.log(pct_int);
    increment_pct(-1)
})

const pct_p1 = document.querySelector("#pct-p1")
pct_p1.addEventListener('click', () => {
    console.log(pct_int);
    increment_pct(1)
})

const pct_p5 = document.querySelector("#pct-p5")
pct_p5.addEventListener('click', () => {
    console.log(pct_int);
    increment_pct(5)
})



function increment_pct(change){
    //First case: when decreasing (by 1 or 5)
    if (change < 0 && pct_int + change > 0) {
        pct_int = pct_int + change;
        console.log('Int changed');
    } else if (change > 0 && pct_int + change <= 150) {
        pct_int = pct_int + change;

    }

    pct_text.textContent = pct_int;
}




// Then should do some math...like render table?

let pace_table = document.querySelector(".pace-table")



