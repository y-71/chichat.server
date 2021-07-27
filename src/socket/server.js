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
        console.log('Peer data', peer);
        // Check peer data
        if((!peer.topic || !peer.ID)) return;
        const {topic, ID} = peer;

        // cache socket
        const socketID = socket.id;
        sockets[socketID] = topic;
        // validate peer information
        const validatePeer = () =>{

            if (!(topic in topicQueues) ) topicQueues[topic] = new Queue();

            if (!ID || !isValidID(ID))
                {
                    console.error("ID is not valid");
                    return;
                }
        }
        // Match peer with another peer
        const handlePeer = () =>{
            const queue = topicQueues[topic];
            const matchPeer = queue.dequeue();
            // We found a matching peer, inform both peers
            if (matchPeer)
                {
                    console.log('Found a matching peer, matchID:', matchPeer.ID);
                    // Inform the caller to make the call
                    socket.emit("caller", {matchID: matchPeer.ID});
                    // Inform the calle to answer the call
                    matchPeer.socket.emit("callee");
                }
            else{
                    // Add current peer to the queue, he will waits until a matching peer show up
                    queue.enqueue({ID, socket});
                }
        }
        validatePeer();
        handlePeer();
    });

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        console.log('Client disconnected')
        // Get topic correspondant to the socket
        topic = sockets[socket.id];
        if(!topic) return;
        // Delete user from correspondant topic queue
        if(topicQueues[topic]){
            console.log('Delete a user from ', topic, 'queue')
            topicQueues[topic].delete(socket.id);
            topicQueues[topic].log()
        }

        delete sockets[socket.id];
        console.log(sockets)
    });
})

