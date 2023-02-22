const net = require("net");
let resultsActive = false;
let timeActive = false;
let localLynxServer = net.createServer((socket) => {
  socket.on("data", (async (data) => {
    let lynxData = data.toString();
    console.log(lynxData)
//If starts signal sent from lynx, trigger the dak to the starts list button    
    
    if (lynxData.indexOf('Command=LayoutDraw;Name=Starts;Window=1;Clear=1;') !== -1 /*&& resultsActive === false*/) {
      const axios = require('axios');
      const dak_starts = {
        "action": "activate_grid_cell",
        "grid": "grid",
        "cell": [6, 1],
      };
      axios.post('http://192.168.1.44:5201', dak_starts)
        .then((res) => {
          console.log(`Status: ${res.status}`);
          console.log(res.data);
        }).catch((err) => {
          console.error(err);
        });
    }
// If results signal sent from lynx, evaluate the expressions by triggering the grid button, wait 1s, play the motion on the floor boards.
    if (lynxData.indexOf('Command=LayoutDraw;Name=Results;Window=2;Clear=1;') !== -1 && resultsActive === false) {
      const axios = require('axios');
      const eval_expressions =
      {
        "action": "activate_grid_cell",
        "grid": "grid",
        "cell": [0, 0],
      };
      const play_results = {
        "action": "play_motions",
        "motions": "TimeResults Competitor Data",
      };
      const dak_results = {
        "action": "activate_grid_cell",
        "grid": "grid",
        "cell": [6, 0],
      };
      /*axios.post('http://192.168.1.44:5201', dak_results)
        .then((res) => {
          console.log(`Status: ${res.status}`);
          console.log(res.data);
        }).catch((err) => {
          console.error(err);
        });*/

      try {
        const res = axios.post('http://192.168.1.44:5201', eval_expressions);
        console.log(`Status: ${res.status}`);
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
      // 1 s delay
      await new Promise(resolve => setTimeout(resolve, 250));

      try {
        const res = axios.post('http://192.168.1.44:5201', play_results);
        console.log(`Status: ${res.status}`);
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
      resultsActive = true;
      timeActive = false;
    }
// If time signal received from lynx, play the running time motion in CW.

    if (lynxData.indexOf('Command=LayoutDraw;Name=Time;Clear=1;') !== -1) {
      const axios = require('axios');
      const data = {
        "action": "play_motions",
        "motions": "TimeResults Running Time",
      };
      
      axios.post('http://192.168.1.44:5201', data)
        .then((res) => {
          console.log(`Status: ${res.status}`);
          console.log(res.data);
        }).catch((err) => {
          console.error(err);
        });
        resultsActive = false;
      }
    // check the lynxData variable for either of two strings you want by using indexOf
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf
    // if either string exists, then make the appropriate post call
  }));
}).on("error", (err) => {
  console.error(err);
}).on("close", () => {
  console.log("Lynx server closed.");
});
localLynxServer.listen(8905, () => {
  console.log("opened server on", localLynxServer.address());
});