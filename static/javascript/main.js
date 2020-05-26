var synth = new Tone.Oscillator({
				"frequency" : 420,
				"type" : "sawtooth10",
				"volume" : -Infinity,
				"detune" : Math.random() * 30 - 15}).toMaster();
var ws = new WebSocket('ws://' + document.domain + ':' + location.port + '/ws');

var sides = [0,1];
var sides_titles = ["Volume", "Frequancy"];


var Dranges = [[0,200],[0,200]];
var Vranges = [[0,100],[27.5, 4186]];

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
  $('#play').hide()
  $('#stop').show()
  var context = new AudioContext();
  synth.start();
  ws.onmessage = function (event) {
       synth.triggerRelease();
       data = JSON.parse(event.data);
       //percentage of Distance to Max Distance times range of the Frequancy
       freq = ((parseFloat(data[1])-Dranges[sides[1]][0]/Dranges[sides[1]][1]) * (Vranges[1][1] - Vranges[1][0])) + Vranges[1][0];
       volume = ((parseFloat(data[0])-Dranges[sides[0]][0]/Dranges[sides[0]][1])*(Vranges[0][1] - Vranges[0][0])) + Vranges[0][0];//give a percentage of how intense the note will be
       freq = freq.toFixed(2)
       volume = (volume/100).toFixed(2)
       console.log("Freq = "+ freq);
       console.log("Volume = "+ volume);
       if (freq < maxfreq && freq > minfreq){
         synth.frequency.rampTo(freq, 1)
         synth.volume.rampTo(volume, 1)
       }
		 }
});
$('#stop').click(function() {
  $('#stop').hide()
  $('#play').show()
  synth.stop();
  ws.onmessage = ""
});

$('#left').submit(function(e) {
    e.preventDefault();
    console.log( $("#right .Variable").val())
    Dranges[0] = [$("#Lmin").val(), $("#Lmax").val() ] ;
    Vranges[sides[0]] = [$("#right .Variable .min").val(), $("#right .Variable .max").val()];
    console.log(Dranges, Vranges)
});
$('#right').submit(function(e) {
    e.preventDefault();
    console.log( )
    Dranges[1] = [$("#Rmin").val(), $("#Rmax").val() ] ;
    Vranges[sides[1]] = [$("#right .Variable .min").val(), $("#right .Variable .max").val()];
  console.log(Dranges, Vranges)
});
