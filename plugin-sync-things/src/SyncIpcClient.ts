import { Actions } from '@twilio/flex-ui';
import { v4 as uuidv4 } from 'uuid'; // Each request needs a UUID so that Flex doesn't error during concurrent requests

export interface SyncDocIpcPayload {
  mode: 'GET' | 'UPDATE' | 'CLOSE',
  id: string,
  ttl: number | undefined,
  data: object,
  requestId: string
}

class SyncIPCClient {
  #cache: any;

  constructor() {
    this.#cache = {};
    
    Actions.addListener("afterSyncDocIPC", async (payload: SyncDocIpcPayload) => {
      switch (payload.mode) {
        case 'GET':
        case 'UPDATE':
          this.#cache[payload.id] = {
            data: payload.data
          }
          break;
        case 'CLOSE':
          break;
      }
    });
  }

  /**
   * Returns the Sync Document instance
   * @param docName the Sync Document to return
   */
  getSyncDoc = async (id: string) => {
    try {
      await Actions.invokeAction("SyncDocIPC", { mode: 'GET', id, ttl: 1209600, requestId: uuidv4() });
    } catch {
      console.error('Unable to invoke SyncDocIPC action. Are you missing a plugin?');
    }
    
    return this.#cache[id];
  };

  /**
   * This is where we update the Sync Document
   * @param id the doc name to update
   * @param data the object to update the doc with
   */
  updateSyncDoc = async (id: string, data: object) => {
    try {
      await Actions.invokeAction("SyncDocIPC", { mode: 'UPDATE', id, ttl: 1209600, data, requestId: uuidv4() });
    } catch {
      console.error('Unable to invoke SyncDocIPC action. Are you missing a plugin?');
    }
    return this.#cache[id];
  };

  /**
   * Called when we wish to close/unsubscribe from a specific sync document
   * @param id the doc name to close
   */
  closeSyncDoc = async (id: string) => {
    try {
      await Actions.invokeAction("SyncDocIPC", { mode: 'CLOSE', id, requestId: uuidv4() });
    } catch {
      console.error('Unable to invoke SyncDocIPC action. Are you missing a plugin?');
    }
  };
}

const syncIpcClient = new SyncIPCClient();

export default syncIpcClient;
