var _ = require('lodash');

class Queue {

    constructor()
    {
        this.users = [];
    }

    log(){
        console.log("Users:",this.users);
    }

    enqueue(user){
        this.users.push(user);
    }
    dequeue(){
        if(this.users.isEmpty)
            return NaN;
        return this.users.shift();
    }
    delete(socketID){
        // remove correspondant user from provided socket
        this.users = _.filter(this.users, (user) => {
            return user.socket.id !== socketID;
        });
    }
}

module.exports = Queue;
