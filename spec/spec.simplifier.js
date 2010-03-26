//
//  Tests for Simplifier dispatcher
//
describe 'Simplifier'
  before_each
  end
  
  /** 
    Serial flow execution
  **/  
  describe 'Serial Flow'
    it 'Should Correctly Execute Simple Serial Flow' 
      // Keep track of running
      var running = true;
      // Define a serial flow
      var serialFlow = new simplifier.SerialFlow(
        function(callback) { callback(null, {doc:'requestDoc'}); }, 
        function(err, requestDoc, callback) { callback(null, {doc:'userDoc'}); }
      );
  
      //
      //  Execute all the functions and feed results into final method
      //  
      new simplifier.Simplifier().execute(
        // Flow to execute
        serialFlow,
        // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
        function(err, userDocResult) {  
          err.should.be_null
          userDocResult.doc.should.eql "userDoc"
          // Signal test finished
          running = false;
        }
      ); 
      
      var intervalId = setInterval(function() {
        while(running) {}
        clearInterval(intervalId);
      }, 100);             
      // Trigger mock timer to start the execution
      tick(100);          
    end
    
    it 'Should Correctly Execute a set of functions serially'
      // Keep track of running
      var running = true;
      
      //
      //  Execute all the functions and feed results into final method
      //  
      new simplifier.Simplifier().execute(
        // Flows to execute
        function(callback) { callback(null, {doc:'requestDoc'}); }, 
        function(err, requestDoc, callback) { callback(null, {doc:'userDoc'}); },
        // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
        function(err, userDocResult) {  
          err.should.be_null
          userDocResult.doc.should.eql "userDoc"
          // Signal test finished
          running = false;
        }
      );       

      var intervalId = setInterval(function() {
        while(running) {}
        clearInterval(intervalId);
      }, 100);             
      // Trigger mock timer to start the execution
      tick(100);                
    end

    it 'Should execute a single method in serial'
      // Keep track of running
      var running = true;
    
      //
      //  Execute all the functions and feed results into final method
      //  
      new simplifier.Simplifier().execute(
        // Flows to execute
        function(callback) { callback(null, {doc:'requestDoc'}); }, 
        // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
        function(err, requestDocResult) {  
          err.should.be_null
          requestDocResult.doc.should.eql "requestDoc"
          // Signal test finished
          running = false;
        }
      );       

      var intervalId = setInterval(function() {
        while(running) {}
        clearInterval(intervalId);
      }, 100);             
      // Trigger mock timer to start the execution
      tick(100);                
    end
  end  
  
  /** 
    Parallel flow execution
    **/  
  describe 'Parallel Flow'
    it 'Should Correcly Execute Simple Parallel Flow'
      // Keep track of running
      var running = true;
      // Define a parallel flow
      var parallelFlow = new simplifier.ParallelFlow(
        function(callback) { callback(null, {doc:'requestDoc'}); }, 
        function(callback) { callback(null, {doc:'userDoc'}); }
      );
  
      //
      //  Execute all the functions and feed results into final method
      //  
      new simplifier.Simplifier().execute(
        // Flow to execute
        parallelFlow,
        // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
        function(requestDocResult, userDocResult) { 
          requestDocResult[0].should.be_null
          requestDocResult[1].doc.should.eql "requestDoc"
          userDocResult[0].should.be_null
          userDocResult[1].doc.should.eql "userDoc"
          // Signal test finished
          running = false;
        }
      ); 
    
      var intervalId = setInterval(function() {
        while(running) {}
        clearInterval(intervalId);
      }, 100);             
      // Trigger mock timer to start the execution
      tick(100);          
    end
  end 
  
  /**
    Combined Parallel and Serial flow execution
  **/
  describe 'Combinations of serial and parallel flows'
    it 'Should correctly execute a serial flow inside of a parallel flow'
      // Keep track of running
      var running = true;
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

          // Signal test finished
          running = false;
        }
      );        
    end

    it 'Should correctly execute a parallel flow inside of a serial flow'
      // Keep track of running
      var running = true;
      // Define a parallel flow
      var parallelFlow = new simplifier.ParallelFlow(
        function(callback) { callback(null, {doc:'requestDoc'}); }, 
        function(callback) { callback(null, {doc:'userDoc'}); }
      );
      
      // Define a serial flow
      var serialFlow = new simplifier.SerialFlow(
        parallelFlow, 
        function(requestDoc, userDoc, callback) { callback(null, userDoc, requestDoc); }
      );
      
      //
      //  Execute all the functions and feed results into final method
      //  
      new simplifier.Simplifier().execute(
        serialFlow,
        // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
        function(err, userDocResult, bangBangDocResult) { 
          userDocResult[0].should.be_null
          userDocResult[1].doc.should.eql "userDoc"
          
          bangBangDocResult[0].should.be_null
          bangBangDocResult[1].doc.should.eql "requestDoc"

          // Signal test finished
          running = false;
        }
      );        
    end    
  end
  
  /**
    Error handling during execution
  **/
  describe 'Error handling during execution'
    it 'Should correctly handle simple error returned from serial function'
      // Keep track of running
      var running = true;
    
      //
      //  Execute all the functions and feed results into final method
      //  
      new simplifier.Simplifier().execute(
        // Flows to execute
        function(callback) { callback("Some error", null); }, 
        function(err, requestDoc, callback) { callback(null, {doc:'userDoc'}); },
        // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
        function(err, userDocResult) {  
          err.should.not.be_null
          err.should.eql "Some error"
          // Signal test finished
          running = false;
        }
      );       

      var intervalId = setInterval(function() {
        while(running) {}
        clearInterval(intervalId);
      }, 100);                   
      // Trigger mock timer to start the execution
      tick(100);                
    end

    it 'Should correctly handle exception being thrown from serial function'
      // Keep track of running
      var running = true;
    
      //
      //  Execute all the functions and feed results into final method
      //  
      new simplifier.Simplifier().execute(
        // Flows to execute
        function(callback) { throw "Exception"; }, 
        function(err, requestDoc, callback) { callback(null, {doc:'userDoc'}); },
        // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
        function(err, userDocResult) {  
          err.should.not.be_null
          err.should.eql "Exception"
          // Signal test finished
          running = false;
        }
      );       

      var intervalId = setInterval(function() {
        while(running) {}
        clearInterval(intervalId);
      }, 100);             
      // Trigger mock timer to start the execution
      tick(100);                
    end
  end
  
  it 'Should correctly handle simple error returned from parallel execution'
    // Keep track of running
    var running = true;
    // Define a parallel flow
    var parallelFlow = new simplifier.ParallelFlow(
      function(callback) { callback("Some error", {doc:'requestDoc'}); }, 
      function(callback) { throw "Exception"; }
    );
  
    //
    //  Execute all the functions and feed results into final method
    //  
    new simplifier.Simplifier().execute(
      parallelFlow,
      // All results coming back are arrays function1 [err, doc] function2 [err, doc1, doc2]
      function(requestDoc, userDoc) { 
        requestDoc[0].should.not.be_null
        requestDoc[0].should.eql "Some error"

        userDoc[0].should.not.be_null
        userDoc[0].should.eql "Exception"

        // Signal test finished
        running = false;
      }
    );        
  end
end
















