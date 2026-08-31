Claude - this is a popular pace calculator I made a few years ago, it was one of my first html/js/css projects EVER so it may not have fully "correct" functionality or best-practice coding.  


We are on a new branch to add a new feature, namely the ability to input, and output, decimals as part of the pace. I will add a folder you have access to showcasing the "race pace calculator", a later app that I built that has a similar functionality.  

We are also going to add some other features detailed below

## Features we already completed  

We want to do the following: 

(1) look at the code and identify any current issues or serious bugs  
(2) add a ".00" button to the input, similar to the one in the race pace calculator app I'm linking, that allows the user to input a decimal after the seconds input, e.g. 2:30.1 instead of right now where you can only input 2:30.  

By default the decimal button should be off (disabled) and the decimal input hidden (and set to zero, so "2:30" means "2:30.0").  

When the .00 button is toggled, the decimal input dial should appear and when we parse the pace and do calculations we should read in the decimals as well.  

IMPORTANT: as in the race pace calculator when the decimal button is disabled again, we should go in and force the decimal value to be zero, so someone does not set it to "2:30.5" then disable .00, see "2:30" and think they are dealing with "2:30.0" when the calculator is still set to 2:30.5. So, like the race pace calcualtor does, we should set the decimals to .0 when we disable the .00 button.  

One difference in this calculator is that the input is just "float minutes" with no explict unit - that's because the percentage calculation is agnostic to the "per" unit, i.e. 90% of 5:00 is 5:30 whether that's 5:00/mi or 5:00/km or 5:00/400m or anything else.  

Now, right now in updateResult() we have a function that uses ParseInt() to construct the represtnation of the pace we need, in minutes, by adding up the dials, but we will need to modify this to deal with the fact that we are adding the decimals dial.  I have a "// CLAUDE:" note for you at this spot in the scripts.js code.  

There is also the issue of the pace conversion dictionary defined in `convert_dict` - we need to deal with the fact that we have decimals here as well. Probaly the ticket here is to modify the `parse_pace` function so it can deal with with the possibility (but not the certainty!) of decimals being in the input string

One thing to be careful of: there is logic in the pace formatting functions to deal with issues like 5:59.6 needing to roll over to 6:00, not 5:60 (a very common issue in these kinds of mm:ss apps) and we will need to be watchful for those kinds of issues with the added decimal place.  

(3) Adding per 200m splits  

One small feature to add, I want to add "/200m" to the pace conversion feature at the bottom of the app, after the /400m button. This should be easy but we will need to add that functionality to the pace conversion


## Features we are working on now

FOR LATER - we will not do this next feature right away but I am noting it here just to get my thoughts down on it. 

(3) Implementing a cookie  

Another feature in the race pace calculator that I would like to transfer over is the "cookie" feature that remembers your previous settings when you leave the page. That means we will need to "populate" the page with these stored values from the cookie *if* the cookie exists.  We should make this cookie SEPARATE from the pre-existing one for the marathon book promotion.  

We will also need to port over the button and styles for the "reset to default" stuff at the bottom of the app, like the race pace calculator has.  