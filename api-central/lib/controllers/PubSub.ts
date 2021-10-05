// Imports the Google Cloud client library
import { PubSub } from "@google-cloud/pubsub";
import { io } from "../server";

export async function quickstart(
    projectId = 'sopes1-proyecto1-325117', // Your Google Cloud Platform project ID
    subscriptionName = 'mensajes-pub', // Name for the new topic to create
    topicName = 'mensajes' // Name for the new subscription to create
) {
    // Instantiates a client
    const pubsub = new PubSub({
        projectId: projectId
    });

    // Creates a subscription on that new topic
    const subscription = await pubsub.topic(topicName).subscription(subscriptionName);

    // Receive callbacks for new messages on the subscription
    subscription.on('message', message => {
        let data = JSON.parse(message.data.toString());
        console.log('Pubsub message:', data);
        io.emit('notificacion', { data });
        message.ack();
    });

    // Receive callbacks for errors on the subscription
    subscription.on('error', error => {
        console.error('Received error:', error);
    });

}