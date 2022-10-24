const net = require("net");
let resultsActive = false;
let timeActive = false;

let localLynxServer = net.createServer((socket) => {
  socket.on("data", ((data) => {
    let lynxData = data.toString();
    console.log(lynxData)
    if (lynxData.indexOf('Command=LayoutDraw;Name=Results;Window=2;Clear=1;') !== -1 && resultsActive === false) {
      
      const axios = require('axios');

      const playmotion = [ { 
      "action": "play_motions",
     "motions": "TimeResults Competitor Data",
    },
    {
        "action": "activate_grid_cell",
        "grid": "grid",
        "cell": [0,0],
      } ];


  axios.post('http://192.168.1.44:5201', playmotion)
    .then((res) => {
      console.log(`Status: ${res.status}`);
      console.log(res.data);
    }).catch((err) => {
    console.error(err);
    });
      
      resultsActive = true;
      timeActive = false;
    }
    
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

          timeActive = true;
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
