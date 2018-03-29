"use strict";

let $roastBtn = $("#roaster-btn");
let $roast = $("#roaster");
let $burnStatus = $("#burn-status");
let roastIndex = 0;

const roastArray = [
  "Errors have been made. Others will be blamed",
  "00100", // represents middle finger in binary
  "Mark Zuckerberg says you should spend more time studying",
  "Your code is so bad. It only works on internet explorer",
  "Yo' Momma's so fat the escape velocity at her surface exceeds 3 times 108 m/s.",
  "I never believed in chaos theory until I saw your variable naming convention!",
  "Light travels faster than sound. This is why some people appear bright until you hear them speak.",
  "If I agreed with you. We would both be wrong."
];

const burnedArray = [
  "Ba-dum-tish!",
  "burned",
  "Oh no you didn't",
  "Stone cold",
  "It's science",
  "Hey-oh!"
];

let roastArrayClone = roastArray.slice(0);
let burnedArrayClone = burnedArray.slice(0);
let msg = new SpeechSynthesisUtterance();
let msg2 = new SpeechSynthesisUtterance();

let voices = window.speechSynthesis.getVoices();

msg.voice = voices[10];
msg.voiceURI = "native";
msg.volume = 0.5; // 0 to 1
msg.rate = 1; // 0.1 to 10
msg.pitch = 1.2; //0 to 2
msg.lang = "en-US";

msg2.voice = voices[10];
msg2.voiceURI = "native";
msg2.volume = 0.5; // 0 to 1
msg2.rate = 0.8; // 0.1 to 10
msg2.pitch = 0.5; //0 to 2
msg2.lang = "en-US";

$roast.hide();
$burnStatus.hide();

/**
 * Check browser audio capabilities
 */
function audioContextCheck() {
  if (typeof AudioContext !== "undefined") {
    return new AudioContext();
  } else if (typeof webkitAudioContext !== "undefined") {
    return new webkitAudioContext();
  } else if (typeof mozAudioContext !== "undefined") {
    return new mozAudioContext();
  } else {
    throw new Error("Audio context not supported");
  }
}

var audioContext = audioContextCheck();

// ----------------------------------------------------------------------------------------

function audioFileLoader(fileDirectory, impulseFileDirectory) {
  var soundObj = {};

  soundObj.fileDirectory = fileDirectory;
  soundObj.impulseFileDirectory = impulseFileDirectory;

  var getSound = new XMLHttpRequest();
  getSound.open("GET", soundObj.fileDirectory, true);
  getSound.responseType = "arraybuffer";

  // ----------------------------------------------------------------------------------------

  getSound.onload = function() {
    audioContext.decodeAudioData(getSound.response, function(buffer) {
      soundObj.soundToPlay = buffer;
    });
  };

  getSound.send();

  // ----------------------------------------------------------------------------------------

  var impulseBuffer;

  var getImpulse = new XMLHttpRequest();
  getImpulse.open("GET", soundObj.impulseFileDirectory, true);
  getImpulse.responseType = "arraybuffer";

  getImpulse.onload = function() {
    audioContext.decodeAudioData(getImpulse.response, function(bufferImpls) {
      impulseBuffer = bufferImpls;
    });
  };

  getImpulse.send();

  // ----------------------------------------------------------------------------------------

  soundObj.play = function() {
    var playSound = audioContext.createBufferSource();
    playSound.buffer = soundObj.soundToPlay;
    var playSoundDry = audioContext.createGain();
    var playSoundWet = audioContext.createGain();
    var mixGain = audioContext.createGain();

    var convolver = audioContext.createConvolver();
    convolver.buffer = impulseBuffer;

    // gain control params
    playSoundDry.gain.value = 0.3;
    playSoundWet.gain.value = 0.3;

    /*______________________________ Routing Diagram __________________________________________

    playSound - > convolver - > playSoundWet - - - mixGain - > destination
    playSound - > playSoundDry - - - - - - - - - - ^
  
    ________________________________________________________________________________________*/

    //__________ Node Graph Connections __________

    playSound.connect(convolver);
    convolver.connect(playSoundWet);
    playSound.connect(playSoundDry);
    playSoundDry.connect(mixGain);
    playSoundWet.connect(mixGain);

    mixGain.connect(audioContext.destination);
    playSound.start(audioContext.currentTime);
  };

  return soundObj;
}

/**
 * Load Sounds
 */

// var conolutionFileUrl = "https://testinggrounds.info/audio/impulse/marshall.wav";
// var conolutionFileUrl = "https://testinggrounds.info/audio/impulse/echothief/Nature/StanleyParkCliffs.wav";
var convolutionFileUrl =
  "https://testinggrounds.info/audio/impulse/echothief/Stairwells/StrathconaStairwellMcGill.wav";
// var conolutionFileUrl = "https://testinggrounds.info/audio/impulse/airwindows/RoomHuge.mp3";
var kick = audioFileLoader(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/BD0010.mp3",
  convolutionFileUrl
);
// window.addEventListener("mousedown", kick.play, false);

var snare = audioFileLoader(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/SD0010.mp3",
  convolutionFileUrl
);

var highHat = audioFileLoader(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/OH25.mp3",
  convolutionFileUrl
);

var crash = audioFileLoader(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/CY0010.mp3",
  convolutionFileUrl
);

var kick2 = audioFileLoader(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/BD0000.mp3",
  convolutionFileUrl
);

/**
 * Check key pressed
 */
document.addEventListener("keydown", function(e) {
  var keyCode = e.keyCode;
  switch (keyCode) {
    case 65:
      kick.play();
      break;
    case 68:
      snare.play();
      break;
    case 71:
      highHat.play();
      break;
    case 86:
      crash.play();
      break;
    case 32:
      kick2.play();
      break;
  }
});

$roastBtn.on("click", function() {
  let roastArrayLength = roastArrayClone.length;
  let randomIndex = Math.floor(Math.random() * roastArrayLength);
  roastIndex = randomIndex;
  
  let timer = setInterval(function() {
    snare.play();
  }, 60000 / 600);

  setTimeout(function() {
    clearInterval(timer);

    if (roastArrayLength != 0) {
      $roast.html(roastArrayClone[randomIndex]);
      $roast.fadeIn();

      msg.text = roastArrayClone[randomIndex];

      window.speechSynthesis.speak(msg);
      $(".robot__mouth").addClass("robot__mouth--talking");

      roastArrayClone.splice(randomIndex, 1);

      let burned;
      msg.onend = function(e) {
        // console.log("Finished in " + event.elapsedTime + " seconds.");
        $roast.fadeOut(1000);
        $(".robot__mouth").removeClass("robot__mouth--talking");
        clearTimeout(burned);

        burned = setTimeout(function() {
          msg2.pitch = 0.6; //0 to 2
          let burnedArrayLength = burnedArrayClone.length;
          // let randomIndex = Math.floor(Math.random() * burnedArrayLength);

          $burnStatus.html(burnedArrayClone[roastIndex]);
          $burnStatus.fadeIn();

          if (burnedArray[randomIndex] === "Ba-dum-tish!") {
            let baDumTish = setInterval(function() {
              snare.play();
            }, 60000 / 600);

            setTimeout(function() {
              clearInterval(baDumTish);
              setTimeout(function() {
                crash.play();
                $burnStatus.fadeOut();
              }, 400);
            }, 200);
          } else {
            msg2.text = burnedArrayClone[randomIndex];
            window.speechSynthesis.speak(msg2);
            $(".robot2__mouth").addClass("robot2__mouth--talking");
            burnedArrayClone.splice(randomIndex, 1);
          }
        }, 1000);
      };

      msg2.onend = function(e) {
        $(".robot2__mouth").removeClass("robot2__mouth--talking");
        $burnStatus.fadeOut(2000);
      };
    } else {
      console.log("out of roast material");
      roastArrayClone = roastArrayClone.slice(0);
    }
  }, 1000);
});

// $("#guess-btn").on("click", function() {
//   window.open("https://www.youtube.com/watch?v=b3_lVSrPB6w");
// });
