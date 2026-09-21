# Pace percentage calculator  


Serverless Javascript app to calculate percentages of race pace for Renato Canova-style interval workouts for runners. Features:  

* Can operate in "forward mode" (i.e. what is 85% of 5:12 mile pace?) and "reverse mode" (3:15/km is 90% of what pace?).  
* Also includes a unit conversion engine to convert paces to and from `/mi`, `/km`, and `/400m` splits.  
* Can calculate both percent of pace (default) and percentages of speed - see [this article](https://runningwritings.com/2013/02/brief-thoughts-calculating-percentages.html) for relevant differences. 
     * Renato Canova uses percent of *pace*, and I do too.
* App page has [detailed instructions](https://apps.runningwritings.com/pace-percent/#how-to-use) on typical use cases and some suggested workouts.

[Find the app here!](https://apps.runningwritings.com/pace-percent/)  

  

## Build and deploy

```
npm run build      # stamps this app's own css/js with today's date, then assembles dist/ (exactly the upload set)
```

Deploy = upload the contents of `dist/` to the SiteGround path the build prints. The build fails if a referenced asset is missing, if a page points at a file that is not in `dist/`, or if a `?v=dev` stamp is left. `tools/build-dist.mjs` and `tools/stamp.mjs` are byte-identical across the RW web apps; this app's file list is `rwBuild` in `package.json`.
