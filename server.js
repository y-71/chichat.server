const {Server} = require("socket.io")
const server = new Server(8000,
    {
        cors: {
            origin: "http://localhost:3000",
        }
    },
    {transports: ['websocket']}
)

const topicsQueues = new Map()

topicsQueues.set('Music', [])
topicsQueues.set('Movies', [])
topicsQueues.set('Politics', [])

// event fired every time a new client connects:
server.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`)
    // Receive peer data : uid and topicName
    socket.on('newPeerInformations', data => {
        console.log('Peerdata', data)
        // Match peer with another peer
        if(data.topicName && data.peerId){
            const {topicName, peerId} = data
            //Adding user to the waiting pool
            topicsQueues.set(topicName, [...topicsQueues.get(topicName), peerId])

            // if there is a match, send otherPeerUid
            const topicQueue = topicsQueues.get(topicName)
            // Check peers
            if(topicQueue.length > 1 && topicQueue[topicQueue.length] !== peerId){
                const otherPeerId = topicQueue[topicQueue.length]
                // Remove selectedPeer from the queue
                topicQueue.pop()
                topicsQueues.set(topicName, [...topicQueue])
                // Send otherPeerId to begin the call
                socket.emit(`matching-${peerId}`, {otherPeerId})
            }
        }
    })

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        //sequenceNumberByClient.delete(socket);
        console.info(`Client gone [id=${socket.id}]`)
    })
})
