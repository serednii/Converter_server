
const { dataStore } = require('./store');
class ServerPorts {
    static freePorts = [];
    static errorPorts = [];

    constructor(numberPorts) {
        this.numberPorts = numberPorts;
        this.getFreePorts(numberPorts)
    }

    getFreePorts(numberPorts) {
        try {

            const lengthFreePort = ServerPorts.freePorts.length;

            if (lengthFreePort === 0) {
                throw Error('Немає вільних серверів')
            }
            //забираємо потрібну кількість портів для процесу
            const ports = ServerPorts.freePorts.splice(0, numberPorts);
            this.ports = ports
            this.length = ports.length
            console.log('getFreePorts', ServerPorts.freePorts)
        } catch (error) {
            console.log('getFreePorts', error)
        }
    }


    returnPorts() {
        try {
            // ServerPorts.freePorts.push(...this.ports)
            //Якщо порта немає то ми недобавляємо
            console.log("returnPorts Before", ServerPorts.freePorts)
            const startPort = dataStore.startPorts
            const endPort = dataStore.numberFreePorts + dataStore.startPorts
            console.log(startPort)
            console.log(endPort)

            this.ports.forEach(port => {
                if (!ServerPorts.freePorts.includes(port) &&
                    port >= startPort && port <= endPort) {
                    ServerPorts.freePorts.push(port)
                }
            })

            this.ports.length = 0;
            console.log("returnPorts After", ServerPorts.freePorts)
        } catch (error) {
            console.log('returnPorts', error)
        }
    }

    static generateFreePorts() {
        ServerPorts.freePorts = Array.from({ length: dataStore.numberFreePorts }).map((_, i) => (dataStore.startPorts + i))
    }

}

module.exports = ServerPorts;