var pomodoro = {
    init: function() {
  
      this.domVariables();
      this.timerVariables();
      this.bindEvents();
      this.updateAllDisplays();
      this.requestNotification();
    },
    // Define notifications to be used by Pomodoro
    breakNotification: undefined,
    workNotification: undefined,
    domVariables: function() {
  
      // Toggle timer buttons
      this.toggleTimerBtns = document.getElementsByClassName( "toggle-timer" );
      this.increaseSession = document.getElementById( "increase-session" );
      this.decreaseSession = document.getElementById( "decrease-session" );
      this.increaseBreak   = document.getElementById( "increase-break" );
      this.decreaseBreak   = document.getElementById( "decrease-break" );
  
      // Timer display
      this.sessionLengthDisplay = document.getElementById( "session-length" );
      this.breakLengthDisplay   = document.getElementById( "break-length" );
  
      // Countdown
      this.countdownDisplay   = document.getElementById( "countdown" );
      this.typeDisplay        = document.getElementById( "type" );
      this.resetCountdownBtn  = document.getElementById( "reset-session" );    
      this.stopCountdownBtn   = document.getElementById( "stop-session" ); 
      this.startCountdownBtn  = document.getElementById( "start-session" );
      this.countdownContainer = document.getElementById( "countdown-container" );        
    }, 
    timerVariables: function() {
  
      // Initial Length values
      this.sessionLength =  20;
      this.breakLength   =  5;   
  
      // Define the variable that includes the setinterval method
      // If the clock is counting down, the value will be true, and 
      // the counter will be stopped on click. 
      this.timeinterval = false;
      this.workSession = true;
      this.pausedTime = 0;
      this.timePaused = false;
      this.timeStopped = false;
      // Request permission 
    },
    bindEvents: function() {
  
      // Bind increase/ decrease session length to buttons
      this.increaseSession.onclick = pomodoro.incrSession;
      this.decreaseSession.onclick = pomodoro.decrSession;
      this.increaseBreak.onclick = pomodoro.incrBreak;
      this.decreaseBreak.onclick = pomodoro.decrBreak;
  
      // Bind start date to #countdown and countdown buttons
      this.countdownDisplay.onclick  = pomodoro.startCountdown;
      this.resetCountdownBtn.onclick = pomodoro.resetCountdown;
      this.stopCountdownBtn.onclick  = pomodoro.stopCountdown;
      this.startCountdownBtn.onclick = pomodoro.startCountdown;
  
    },
    updateAllDisplays: function() {
  
      // Change HTML of displays to reflect current values
      pomodoro.sessionLengthDisplay.innerHTML = this.sessionLength;
      pomodoro.breakLengthDisplay.innerHTML   = this.breakLength;
      pomodoro.countdownDisplay.innerHTML     = this.sessionLength + ":00";
  
      pomodoro.resetVariables();
  
    },
    requestNotification: function() {
      
      if (!("Notification" in window)) {
        return console.log("This browser does not support desktop notification");
      }
      
      
      
    },
    incrSession: function() {
  
      if ( pomodoro.sessionLength < 59 ) {
        pomodoro.sessionLength += 1;
        pomodoro.updateAllDisplays();    
      }   
  
    },
    decrSession: function() {
  
      if (  pomodoro.sessionLength > 1 ) {
        pomodoro.sessionLength -= 1;
        pomodoro.updateAllDisplays();      
      }
  
    },
    incrBreak: function() {
  
      if (  pomodoro.breakLength < 30 ) {
        pomodoro.breakLength += 1;
        pomodoro.updateAllDisplays();    
      }
  
    },
    decrBreak: function() {
  
      if ( pomodoro.breakLength > 1 ) {
        pomodoro.breakLength -= 1;
        pomodoro.updateAllDisplays();     
      }    
  
    },
    // Reset variables to initial values
    resetVariables: function() {
  
      pomodoro.timeinterval = false;
      pomodoro.workSession = true;
      pomodoro.pausedTime = 0;
      pomodoro.timeStopped = false;
      pomodoro.timePaused = false;
  
    },
    startCountdown: function() {
  
      pomodoro.disableButtons();
      // Toggle typeDisplay and background color between work and break
      pomodoro.displayType();
  
      // Pause pomodoro if countdown is currently running, otherwise start
      // countdown
      if ( pomodoro.timeinterval !== false ) {
        pomodoro.pauseCountdown();
      } else {
        // Set start and end time with system time and convert to 
        // miliseconds to correctly meassure time ellapsed
        pomodoro.startTime = new Date().getTime();
  
        // Check if pomodoro has just been unpaused
        if ( pomodoro.timePaused === false ) {
          pomodoro.unPauseCountdown();
        } else {
          pomodoro.endTime = pomodoro.startTime + pomodoro.pausedTime;
          pomodoro.timePaused = false;
        }  
  
        // Run updateCountdown every 990ms to avoid lag with 1000ms,
        // Update countdown checks time against system time and updates
        // #countdown display
        pomodoro.timeinterval = setInterval(pomodoro.updateCountdown,990); 
      }
       
    },
    updateCountdown: function() {
  
      // Get differnce between the current time and the 
      // end time in miliseconds. difference = remaining time
      var currTime = new Date().getTime();
      var difference = pomodoro.endTime - currTime;
  
      // Convert remaining milliseconds into minutes and seconds 
      var seconds = Math.floor( ( difference/1000 ) % 60 );
      var minutes = Math.floor( ( difference/1000 ) / 60 % 60 );
  
      // Add 0 to seconds if less than ten
      if ( seconds < 10 ) { seconds = "0" + seconds; }
  
      // Display remaining minutes and seconds, unless there is less than 1 second
      // left on timer. Then change to next session.
      if ( difference > 1000 ) {
        pomodoro.countdownDisplay.innerHTML = minutes + ":" + seconds;
      } else {
        pomodoro.changeSessions();
      }  
  
    },
    changeSessions: function() {
  
      // Stop countdown
      clearInterval( pomodoro.timeinterval );
  
      pomodoro.playSound();
  
      // Toggle between workSession being active or not
      // This determines if break session or work session is displayed
      if ( pomodoro.workSession === true ) {
        pomodoro.workSession = false;
      } else {
        pomodoro.workSession = true;
      }
  
      // Stop countdown
      pomodoro.timeinterval = false;
      // Restart, with workSession changed
      pomodoro.startCountdown();
  
    },
    pauseCountdown: function() {
  
          // Save paused time to restart clock at correct time
          var currTime = new Date().getTime();
          pomodoro.pausedTime = pomodoro.endTime - currTime;
          pomodoro.timePaused = true;      
  
          // Stop the countdown on second click    
          clearInterval( pomodoro.timeinterval );    
         
  
          // Reset variable so that counter will start again on click
          pomodoro.timeinterval = false;
    },
    unPauseCountdown: function() {
      if ( pomodoro.workSession === true ) {
        pomodoro.endTime = pomodoro.startTime + ( pomodoro.sessionLength * 60000 );
      } else {
        pomodoro.endTime = pomodoro.startTime + ( pomodoro.breakLength * 60000 );      
      }  
    },
    resetCountdown: function(){
  
      // Stop clock and reset variables
      clearInterval( pomodoro.timeinterval );
      pomodoro.resetVariables();
  
      // Restart variables
      pomodoro.startCountdown();
     
    },
    stopCountdown: function() {
  
      // Stop timer
      clearInterval( pomodoro.timeinterval );
  
      // Change HTML
      pomodoro.updateAllDisplays();
  
      // Reset Variables
      pomodoro.resetVariables();
  
      pomodoro.unDisableButtons();
  
    },
    displayType: function() {
      // Check what session is running and change appearance and text above
      // countdown depending on session (break or work)
      if ( pomodoro.workSession === true ) {
        pomodoro.typeDisplay.innerHTML = "work session";
        pomodoro.countdownContainer.className = pomodoro.countdownContainer.className.replace( "break", "" );
      } else {
        pomodoro.typeDisplay.innerHTML = "Break";
        if ( pomodoro.countdownContainer.className !== "break" ) {
          pomodoro.countdownContainer.className += "break";
        }
      }   
  
    },
    playSound: function() {
  
      var mp3 = "http://soundbible.com/grab.php?id=1746&type=mp3";
      var audio = new Audio(mp3);
      audio.play();    
  
    },
    disableButtons: function() {
  
      for (var i = 0; i < pomodoro.toggleTimerBtns.length; i++) {
        pomodoro.toggleTimerBtns[i].setAttribute("disabled", "disabled");
        pomodoro.toggleTimerBtns[i].setAttribute("title", "Stop the countdown to change timer length"); 
      } 
  
    },
    unDisableButtons: function() {
  
      for (var i = 0; i < pomodoro.toggleTimerBtns.length; i++) {
        pomodoro.toggleTimerBtns[i].removeAttribute("disabled"); 
        pomodoro.toggleTimerBtns[i].removeAttribute("title"); 
      }  
  
    }
  };
  
  // Initialise on page load
  pomodoro.init();