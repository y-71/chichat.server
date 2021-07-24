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
    // TODO : test this! could be buggy
    delete(socketID){
        // get the socket index:
        for (let index = 0 ; index < this.users.length ; i++) {
            if (socketID === this.users[index].socket.id){
                console.log('before delete users', this.users);
                this.users = _.filter(this.users, (user) => {
                    return user.socket.id !== socketID;
                });
                console.log('after delete users', this.users);
                break;
            }
        }
    }
}

module.exports = Queue;
