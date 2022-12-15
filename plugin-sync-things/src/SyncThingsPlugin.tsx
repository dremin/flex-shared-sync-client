import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';

import SyncIpcClient from './SyncIpcClient';

const PLUGIN_NAME = 'SyncThingsPlugin';

export default class SyncThingsPlugin extends FlexPlugin {
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
    flex.Actions.addListener("afterSetActivity", async (payload) => {
      const workerSid = `activity-${manager.store.getState().flex.worker.worker?.sid}`;
      if (!workerSid) {
        console.error('Unable to get worker sid');
        return;
      }
      
      const doc = await SyncIpcClient.getSyncDoc(workerSid);
      if (!doc) {
        console.error('Unable to get sync doc');
        return;
      }
      let { data } = doc;
      
      console.log('Previous activity data:', data);
      
      data.activityName = payload.activityName;
      data.activitySid = payload.activitySid;
      
      const updatedDoc = await SyncIpcClient.updateSyncDoc(workerSid, data);
      
      console.log('New activity data:', updatedDoc.data);
    });
  }
}
