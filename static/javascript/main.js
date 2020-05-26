var oscillator;

var ws = new WebSocket('ws://' + document.domain + ':' + location.port + '/ws');

var sides = [0,1];
var sides_titles = ["Volume", "Frequancy"];


var Dranges = [[0,200],[0,200]];
var Vranges = [[0,100],[27.5, 4186]];

var ChangeRate = 1

var html = [$("#left .Variable").html(), $("#right .Variable").html()];
$('#stop').hide()
$("#swap").click(function() {
                 sides.reverse();
                 $("#left h1").html(sides_titles[sides[0]]);
                 $("#left .Variable").html(html[sides[0]]);
                 $("#right h1").html(sides_titles[sides[1]]);
                 $("#right .Variable").html(html[sides[1]]);
});

$("#play").click(function() {
	var context = new AudioContext();
  $('#play').hide()
  $('#stop').show()
	oscillator = new Tone.Oscillator({"frequency" : 440,"type" : "sawtooth10","volume" : -Infinity,"detune" : Math.random() * 30 - 15}).toMaster();
  oscillator.start();
  ws.onmessage = function (event) {
       data = JSON.parse(event.data);
       //percentage of Distance to Max Distance times range of the Frequancy
       freq = (((parseFloat(data[1])-Dranges[sides[1]][0])/Dranges[sides[1]][1]) * (Vranges[1][1] - Vranges[1][0])) + Vranges[1][0];
       volume = (((parseFloat(data[0])-Dranges[sides[0]][0])/Dranges[sides[0]][1])*(Vranges[0][1] - Vranges[0][0])) + Vranges[0][0];//give a percentage of how intense the note will be
       freq = parseFloat(freq).toFixed(2)
       volume = parseInt(volume)
       console.log("Freq = "+ freq);
       console.log("Volume = "+ volume);
       if (freq < Vranges[1][1] && freq > Vranges[1][0]){
         oscillator.frequency.rampTo(freq, ChangeRate)
         oscillator.volume.rampTo(volume, ChangeRate)
       }
		 }
});
$('#stop').click(function() {
  $('#stop').hide()
  $('#play').show()
	oscillator.stop();
	oscillator.volume.rampTo(-Infinity, 1);
	oscillator = None
	ws.onmessage = None
});

$('#left').submit(function(e) {
    e.preventDefault();
    Dranges[0] = [$("#Lmin").val(), $("#Lmax").val() ] ;
    Vranges[sides[0]] = [$("#left .Variable .min").val(), $("#left .Variable .max").val()];
    console.log(Dranges, Vranges)
});
$('#right').submit(function(e) {
    e.preventDefault();
    Dranges[1] = [$("#Rmin").val(), $("#Rmax").val() ] ;
    Vranges[sides[1]] = [$("#right .Variable .min").val(), $("#right .Variable .max").val()];
  console.log(Dranges, Vranges)
});
