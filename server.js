const {Server} = require("socket.io");
let Queue = require ("./queue");

const server = new Server(8000,
    {
        cors: {
            origin: "http://localhost:3000",
        }
    },
    {transports: ['websocket']}
);


const topicQueues = {};
topicQueues.Music = new Queue();
topicQueues.Politics = new Queue();
topicQueues.Movies = new Queue();

const sockets = {};
const isValidID = (ID) =>{
    return true;
}


// event fired every time a new client connects:
server.on("connection", (socket) => {

    console.info(`Client connected [id=${socket.id}]`);
    // Receive peer data : uid and topicName
    socket.on('createPeer', peer => {
        console.log('data', peer);

        // Match peer with another peer
        if((!peer.topic || !peer.ID)) return;


        const {topic, ID} = peer;

        // cache socket
        const socketID = socket.id;
        sockets[socketID] = topic;

        const validatePeer = () =>{

            if (!(topic in topicQueues) ) topicQueues[topic] = new Queue();

            if (!ID || !isValidID(ID))
                {
                    console.error("ID is not valid");
                    return;
                }
        }
        const handlePeer = () =>{
            // if there is a match, send otherPeerUid
            console.log({topic})
            const queue = topicQueues[topic];
            queue.log()
            const matchpeer = queue.dequeue();

            if (matchpeer)
                {
                    const matchID = matchpeer.ID;
                    const matchSocket = matchpeer.socket;
                    console.log('matchID:', matchID);
                    socket.emit("caller", {matchID});
                    matchSocket.emit("callee");
                }
            else{
                queue.enqueue({ID, socket});
                }
        }
        validatePeer();
        handlePeer();
        });
    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        console.log('client disconnected')
        topic = sockets[socket.id];
        if(topicQueues[topic]){
            topicQueues[topic].delete(socket.id);
            topicQueues[topic].log()
        }
        delete sockets[socket.id];
        console.log(sockets)
    });
})

