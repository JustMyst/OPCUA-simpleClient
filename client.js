const opcua = require("node-opcua");

const endpointUrl = "opc.tcp://127.0.0.1:49320";
const nodeId = "ns=2;s=Channel1.Device1.sin";
let client, session;

async function main() {

    try {

        client = opcua.OPCUAClient.create({
            connectionStrategy: {
                maxRetry: -1,
                initialDelay: 2000,
                maxDelay: 5 * 1000
            }
        });

        client
            .on("connected", () => {
                _isConnected = true;
            })
            .on("connection_lost", () => {
                _isConnected = false;
            })
            .on("connection_reestablished", async () => {
                _isConnected = true;
                await createSession();
            })
            .on("backoff", () => console.log("retrying connection"));

        await client.connect(endpointUrl);

        await createSession();
    }
    catch (err) {
        console.log("Error !!!", err);
    }
}

async function createSession() {
    try {
        session = await client.createSession();

        session.on("session_closed", async () => {
            console.log("session closed");
            delete session; // => deletes session, but somehow it remains, so throws error on creating new session.
            // await client.closeSession(session,true, (ex)=>console.log(ex)); => throws "Connection Break", but does close session.
        });

        const subscription = opcua.ClientSubscription.create(session, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 10,
            requestedMaxKeepAliveCount: 2,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10
        });

        const monitoredItem = opcua.ClientMonitoredItem.create(
            subscription,
            {
                nodeId: nodeId,
                attributeId: opcua.AttributeIds.Value
            },
            {
                samplingInterval: 1000,
                discardOldest: true,
                queueSize: 10
            },
            opcua.TimestampsToReturn.Neither
        );

        monitoredItem.on("changed", (dataValue) => console.log(`Value = ${dataValue.value.value.toString()}`));
    }
    catch (ex) {
        console.log(ex);
    }
}

main();