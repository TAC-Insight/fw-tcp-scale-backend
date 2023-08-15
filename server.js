const express = require("express");
const net = require("net");
const cors = require("cors");

const app = express();
let scaleWeights = [0, 0, 0, 0];

app.use(express.json());
app.use(cors());

// Port 5010: Express HTTP server for setting and getting scale weights
app.post("/set/:index/:weight", (req, res) => {
	const { index, weight } = req.params;
	const parsedIndex = parseInt(index);
	const parsedWeight = parseInt(weight);

	if (parsedWeight && parsedIndex >= 0 && parsedIndex < 4) {
		scaleWeights[parsedIndex] = parsedWeight;
		res
			.status(200)
			.send(`Scale weight ${parsedIndex} set to: ${scaleWeights[parsedIndex]}`);
	} else {
		res.status(400).send("Invalid parameters");
	}
});

app.get("/get/:index", (req, res) => {
	const { index } = req.params;
	const parsedIndex = parseInt(index);
	if (parsedIndex >= 0 && parsedIndex < 4) {
		res.status(200).json({ weight: scaleWeights[parsedIndex] });
	} else {
		res.status(400).send("Invalid index parameter");
	}
});

const httpPort = 5010;
app.listen(httpPort, () => {
	console.log(`Express server listening on port ${httpPort}`);
});

// Function to create a TCP server sending scale weight every 1 second
function createTCPServer(port, weightIndex) {
	const tcpServer = net.createServer((socket) => {
		const interval = setInterval(() => {
			socket.write(`${scaleWeights[weightIndex]} LB\n`);
		}, 1000);

		socket.on("close", () => {
			clearInterval(interval);
		});
	});

	tcpServer.listen(port, () => {
		console.log(
			`TCP server for weight ${weightIndex} listening on port ${port}`
		);
	});
}

// Port 5011: Raw TCP server sending scale weight 0
createTCPServer(5011, 0);

// Port 5012: Raw TCP server sending scale weight 1
createTCPServer(5012, 1);

// Port 5013: Raw TCP server sending scale weight 2
createTCPServer(5013, 2);

// Port 5014: Raw TCP server sending scale weight 3
createTCPServer(5014, 3);
