Simplify
===============

Overview
---------------
Simplify is just born out of me needed to pretty up my code a little as the banana was
starting to seriously bend when writing code using the mongodb-native driver

Fairly simple to use

You create a serial flow or parallel flow object or just pass a bunch of functions into the execute function

    new simplifier.Simplifier().execute(func1, funct2, ...., finalFunc);

The final function is the endpoint of your flow. You can also combine the flows together so have parts of your
code execute in parallel but still work inside a serial flow.


Installing
---------------
Either just grab the code on 
  
    git@github.com:christkv/node-simplify.git 

or use the kiwi package manager 

    kiwi install simplify


Defining a Serial Flow
---------------------------------------
A serial flow will execute one method after the other feeding the callback results from each function call to the
next function. Take an example of a serial execution below.

    // Define a serial flow
    var serialFlow = new simplifier.SerialFlow(
      function(callback) { callback(null, {doc:'requestDoc'}); }, 
      function(err, requestDoc, callback) { callback(null, {doc:'userDoc'}); }
    );
  
    //
    //  Execute all the functions and feed results into final method
    //  
    new simplifier.Simplifier().execute(
      parallelFlow,
      // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
      function(userDocResult, bangBangDocResult) { 
        // This is jspec code (look at the specs)
        userDocResult[0].should.be_null
        userDocResult[1].doc.should.eql "userDoc"
      
        bangBangDocResult[0].should.be_null
        bangBangDocResult[1].doc.should.eql "bangBangDoc"
      }
    );        
  
The first function does a callback
  
    callback(null, {doc:'requestDoc'});
  
The first argument is for the user to return an error object, if this is a non-null value or the function throws an exception the
execution of the serial flow will terminate immediately and call the final function.

If not the parameters will be passed to the next function.

    function(err, requestDoc, callback) { callback(null, {doc:'userDoc'}); }
  
The callback object is always needed and is provided by the library to handle the execution of the functions

Simple Serial Function Execution
---------------------------------------
If you just provide functions instead of either a SerialFlow or ParallelFlow object to the Simplifier().execute method then
it will execute them serially. An example is shown below

    //
    //  Execute all the functions and feed results into final method
    //  
    new simplifier.Simplifier().execute(
      function(callback) { callback(null, {doc:'requestDoc'}); }, 
      function(err, requestDoc, callback) { callback(null, {doc:'userDoc'}); },
      // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
      function(userDocResult, bangBangDocResult) { 
        // This is jspec code (look at the specs)
        userDocResult[0].should.be_null
        userDocResult[1].doc.should.eql "userDoc"
    
        bangBangDocResult[0].should.be_null
        bangBangDocResult[1].doc.should.eql "bangBangDoc"
      }
    );        

If you just need a simple serial execution of some methods this is a fast and simple way to remove some additional wrap around
code.


Defining a Parallel Flow
---------------------------------------
A parallel flow will execute one-or more functions in parallel and feed the complete results back to the final function.
Take a look at an example below.

    // Define a parallel flow
    var parallelFlow = new simplifier.ParallelFlow(
      function(callback) { callback(null, {doc:'requestDoc'}); }, 
      function(callback) { callback(null, {doc:'userDoc'}); });

    //
    //  Execute all the functions and feed results into final method
    //  
    new simplifier.Simplifier().execute(
      // Flow to execute
      parallelFlow,
      // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
      function(requestDocResult, userDocResult) { 
        // This is jspec code (look at the specs)
        requestDocResult[0].should.be_null
        requestDocResult[1].doc.should.eql "requestDoc"
        userDocResult[0].should.be_null
        userDocResult[1].doc.should.eql "userDoc"
      }
    ); 

Just as in the serial flow returning a non-null value of the first argument of the callback or throwing an error will be handled correctly.
However the main difference is that the values returned are different than in the serial flow as they contain the entire function return state.

so

    requestDocResult looks like an array [null, {doc:'requestDoc'}]
    userDocResult looks like an array [null, {doc:'userDoc'}]
  

Combining flows together
---------------------------------------
Here is an example combining a serial flow with a parallel flow.

    // Define a serial flow
    var serialFlow = new simplifier.SerialFlow(
      function(callback) { callback(null, {doc:'requestDoc'}); }, 
      function(err, requestDoc, callback) { callback(null, {doc:'userDoc'}); }
    );
    // Define a parallel flow
    var parallelFlow = new simplifier.ParallelFlow(
      serialFlow, 
      function(callback) { callback(null, {doc:'bangBangDoc'}); }
    );

    //
    //  Execute all the functions and feed results into final method
    //  
    new simplifier.Simplifier().execute(
      parallelFlow,
      // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
      function(userDocResult, bangBangDocResult) { 
        userDocResult[0].should.be_null
        userDocResult[1].doc.should.eql "userDoc"
    
        bangBangDocResult[0].should.be_null
        bangBangDocResult[1].doc.should.eql "bangBangDoc"
      }
    );        

Same rules apply as above, results from a parallel flow is in the format of an array [err, result1, ...., resultN] and your code needs
to take this into consideration.


