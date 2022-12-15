import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';

import SyncIpcServer from './SyncIpcServer';

const PLUGIN_NAME = 'SyncIpcPlugin';

export interface SyncDocIpcPayload {
  mode: 'GET' | 'UPDATE' | 'CLOSE',
  id: string,
  ttl: number | undefined,
  data: object,
  requestId: string
}

export default class SyncIpcPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    flex.Actions.registerAction("SyncDocIPC", async (payload: SyncDocIpcPayload) => {
      switch (payload.mode) {
        case 'GET':
          const doc = await SyncIpcServer.getSyncDoc(payload.id, payload.ttl);
          payload.data = doc.data;
          break;
        case 'UPDATE':
          payload.data = await SyncIpcServer.updateSyncDoc(payload.id, payload.data, payload.ttl);
          break;
        case 'CLOSE':
          await SyncIpcServer.closeSyncDoc(payload.id);
          break;
      }
    });
  }
}
