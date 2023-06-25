const express = require('express');
const ExpressError = require('./expressError')

const app = express();



// To parse http request body on each request:
app.use(express.json()); //For JSON
app.use(express.urlencoded({ extended: true })); //For Form Data



function convertAndValidateNumsArray(numsAsStrings) {
  let result = [];

  for (let i = 0; i < numsAsStrings.length; i++) {
    let valToNumber = Number(numsAsStrings[i]);

    if (Number.isNaN(valToNumber)) {
      return new Error(
        `The value '${numsAsStrings[i]}' at index ${i} is not a valid number.`
      );
    }

    result.push(valToNumber);
  }
  return result;
}

function findMedian(nums){
  // sort and get the middle element

  nums.sort((a, b) => a - b);

  let middleIndex = Math.floor(nums.length / 2);
  let median;

  if (nums.length % 2 === 0) {
    median = (nums[middleIndex] + nums[middleIndex - 1]) / 2;
  } else {
    median = nums[middleIndex];
  }
  return median
}


function createFrequencyCounter(arr) {
  return arr.reduce(function(acc, next) {
    acc[next] = (acc[next] || 0) + 1;
    return acc;
  }, {});
}


function findMode(arr) {
  let freqCounter = createFrequencyCounter(arr);

  let count = 0;
  let mostFrequent;

  for (let key in freqCounter) {
    if (freqCounter[key] > count) {
      mostFrequent = key;
      count = freqCounter[key];
    }
  }

  return +mostFrequent;
}



//##############################################################################


app.get('/', (req, res) => {
  res.send("HOMEPAGE!")
})

app.get("/mean", function (req, res, next) {
  try {
    if (!req.query.nums) {
      throw new ExpressError('You must pass a query key of nums with a comma-separated list of numbers.', 400)
    }
    let numsAsStrings = req.query.nums.split(',');
    // check if anything bad was put in
    let nums = convertAndValidateNumsArray(numsAsStrings);
    let sum = 0;
    nums.forEach(num => {
      sum += num;
    });
    let mean = sum / nums.length;
      
    return res.send({
      operation: "mean",
      result: mean
    })
  } catch (e) {
    next(e)
  }
})


app.get('/median', function(req, res, next) {
  if (!req.query.nums) {
    throw new ExpressError('You must pass a query key of nums with a comma-separated list of numbers.', 400)
  }
  let numsAsStrings = req.query.nums.split(',');
  // check if anything bad was put in
  let nums = convertAndValidateNumsArray(numsAsStrings);
  if (nums instanceof Error) {
    throw new ExpressError(nums.message);
  }

  let result = {
    operation: "median",
    result: findMedian(nums)
  }

  return res.send(result);
  
});

app.get('/mode', function(req, res, next) {
  try {
    if (!req.query.nums) {
    throw new ExpressError('You must pass a query key of nums with a comma-separated list of numbers.', 400)
    }
  let numsAsStrings = req.query.nums.split(',');
  // check if anything bad was put in
  let nums = convertAndValidateNumsArray(numsAsStrings);
  if (nums instanceof Error) {
    throw new ExpressError(nums.message);
  }

  let result = {
    operation: "mode",
    result: findMode(nums)
  }

  return res.send(result);
  } catch (e) {
    next(e)
  }
});



//##############################################################################

// If no other route matches, respond with a 404
app.use((req, res, next) => {
  const e = new ExpressError("Page Not Found", 404)
  next(e)
})


// Error handler
app.use(function (err, req, res, next) { //Note the 4 parameters!
  // the default status is 500 Internal Server Error
  let status = err.status || 500;
  let message = err.msg;

  // set the status and alert the user
  return res.status(status).json({
    error: { message, status }
  });
});


app.listen(3000, () => {
  console.log("Server running on port 3000")
});