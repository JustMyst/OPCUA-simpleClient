# OPCUA-simpleClient
Simple Client that connects to OPC UA Kepware server and logs values on subscription.


To run:

1. `npm install`
2. `node client.js`

KEPServerEx 6 configuration:

1. In Project > Connectivity => create Channel => Create Device => Create Tag (those 3 are specified in client.js `nodeId`).
2. in OPC UA Configuration add new server endpoint => localhost network adapter, with security policy: NONE
3. Restart server.

