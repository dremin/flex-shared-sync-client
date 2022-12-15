import { Manager } from '@twilio/flex-ui';
import { SyncClient } from 'twilio-sync';

class SyncIpcServer {
  #client: SyncClient;

  constructor(manager: Manager) {
    this.#client = new SyncClient(manager.user.token);

    Manager.getInstance().events.addListener("tokenUpdated", (tokenPayload) => {
      console.log('SyncIpcServer: Refreshing SyncClient Token');
      this.#client.updateToken(tokenPayload.token)
    });
  }

  /**
   * Returns the Sync Document instance
   * @param id the Sync Document to return
   * @param ttl if defined, time the doc should remain
   */
  getSyncDoc = async (id: string, ttl: number | undefined = undefined) => {
    console.log('SyncIpcServer: Retrieving doc', id);
    return this.#client.document({ id, ttl });
  };

  /**
   * Called when we wish to close/unsubscribe from a specific sync document
   * @param id the doc name to close
   */
  closeSyncDoc = async (id: string) => {
    console.log('SyncIpcServer: Closing doc', id);
    const doc = await this.getSyncDoc(id);
    doc.close();
  };
  
  /**
   * This is where we update the Sync Document
   * @param id the doc name to update
   * @param ttl if defined, time the doc should remain
   * @param data the object to update the doc with
   */
  updateSyncDoc = async (id: string, data: Object, ttl: number | undefined = undefined) => {
    console.log('SyncIpcServer: Updating doc', id);
    const doc = await this.getSyncDoc(id);
    return await doc.update(data, { ttl });
  };
}

const syncIpcServer = new SyncIpcServer(Manager.getInstance());

export default syncIpcServer;
