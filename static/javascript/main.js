var oscillator;

var ws;
//sets up variables
var sides = [0,1];
var sides_titles = ["Volume", "Frequency"];
var Dranges = [[0,100],[0,100]];
var Vranges = [[-5,5],[80, 800]];
var ChangeRate = $("#global .ramp").val();
var html = [$("#left .Variable").html(), $("#right .Variable").html()]; //copies the html content that can be swapped


$("#swap").click(function() { //when the swap button is clicked sides is reversed and the html content is swapped
                 sides.reverse();
                 $("#left h1").html(sides_titles[sides[0]]); //Swaps the titles
                 $("#left .Variable").html(html[sides[0]]); //Swaps the Frequency/Volume range Settings
                 $("#right h1").html(sides_titles[sides[1]]); //note that I don't swap the distance settings
                 $("#right .Variable").html(html[sides[1]]);
});

function DatatoPercentage(data, min, max){
  if (min <= data && max >= data){
    return (parseFloat(data)-min)/(max-min); //convert the data into a percentage if in the ranges
  } else if (min <= data) {
    return 1; //if value is above the max value then send 1
  } else {
    return 0; //else if value is send 0
  }
}

$("#play").click(function() {
  if ($("#global").valid()) { //checks if the form has vaild values in before continuing
    var ChangeRate = $("#global .ramp").val();
    ws = new WebSocket('ws://' + document.domain + ':' + location.port + '/ws'); //Starts Websocket connection with the webserver
  	var context = new AudioContext();
  	if (Tone.context.state !== 'running') {
          Tone.context.resume();
    }
    $('#play').hide();
    $('#stop').show();
  	oscillator = new Tone.Oscillator({"frequency" : 440, "type" : $("#type").val(),"volume" : 1,"detune" : Math.random() * 30 - 15}).toMaster();
    oscillator.start();
    ws.onmessage = function (event) {
         data = JSON.parse(event.data);
         freq = DatatoPercentage(data[sides[1]], Dranges[sides[1]][0], Dranges[sides[1]][1]); //Sends to DatatoPercentage with current, min, max distances
         freq = freq * (Vranges[1][1] - Vranges[1][0]) + Vranges[1][0]; //convert the percentage to a frequency in the ranges set by the user
         volume = (parseFloat(data[sides[0]])-Dranges[sides[0]][0])/Dranges[sides[0]][1];
         volume = DatatoPercentage(data[sides[0]], Dranges[sides[0]][0], Dranges[sides[0]][1]);
         volume = volume * (Vranges[0][1] - Vranges[0][0]) + Vranges[0][0];
         freq = parseFloat(freq).toFixed(2);
         volume = parseFloat(volume).toFixed(2);
         if (sides[0] == 0){
           $('#left h3').html(volume + "db");
           $('#right h3').html(freq + "Hz");
         } else {
           $('#right h3').html(volume + "db");
          $('#left h3').html(freq + "Hz");
         }
         //changes the note
         oscillator.frequency.rampTo(freq, ChangeRate);
         oscillator.volume.rampTo(volume, ChangeRate);
  		 }
  }
});

$('#stop').click(function() {
  $('#stop').hide();
  $('#play').show();
  ws.close();
  oscillator.volume.rampTo(-Infinity, 2);
  oscillator.stop();
  oscillator = undefined;
});
$('#global').submit(function(e) {
    e.preventDefault();
});

$('#left').submit(function(e) {
    e.preventDefault();
    Dranges[0] = [parseFloat($("#Lmin").val()), parseFloat($("#Lmax").val() )] ;
    Vranges[sides[0]] = [parseFloat($("#left .Variable .min").val()), parseFloat($("#left .Variable .max").val())];
    console.log(Dranges, Vranges)
});
$('#right').submit(function(e) {
    e.preventDefault();
    Dranges[1] = [parseFloat($("#Rmin").val()), parseFloat($("#Rmax").val()) ] ;
    Vranges[sides[1]] = [parseFloat($("#right .Variable .min").val()), parseFloat($("#right .Variable .max").val())];
  console.log(Dranges, Vranges)
});

$('#stop').hide() //Hides the stop button on start (this also is a great way to check if there are any errors in the code above)
