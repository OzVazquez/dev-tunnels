// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Stream } from '@microsoft/dev-tunnels-ssh';
import { TunnelRelayStreamFactory } from './tunnelRelayStreamFactory';
import { isNode, SshHelpers } from './sshHelpers';
import { IClientConfig } from 'websocket';

/**
 * Default factory for creating streams to a tunnel relay.
 */
export class DefaultTunnelRelayStreamFactory implements TunnelRelayStreamFactory {
    public async createRelayStream(
        relayUri: string,
        connectionType: string,
        accessToken?: string,
        clientConfig?: IClientConfig,
    ): Promise<Stream> {
        if (isNode()) {
            const stream = await SshHelpers.openConnection(
                relayUri,
                [connectionType],
                {
                    ...(accessToken && { Authorization: `tunnel ${accessToken}` }),
                },
                clientConfig,
            );
            return stream;
        } else {
            const protocols = [connectionType];
            // Web sockets don't support auth. Authenticate TunnelRelay by sending accessToken as a subprotocol.
            if (accessToken) {
                protocols.push(accessToken);
            }
            const stream = await SshHelpers.openConnection(relayUri, protocols);
            return stream;
        }
    }
}
