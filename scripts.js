
console.log('Scripts loaded');

let d1 = document.querySelector("#d1");

console.log(parseInt(d1.textContent))

SEC_DIGITS = [1,2,3,4,5,6,7,8,9,0]

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

